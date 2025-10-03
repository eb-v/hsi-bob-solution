'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import PageLayout from '@/app/components/PageLayout';

type Campaign = {
  id: string;
  name: string;
  audienceSize: number;
  holdoutPct: number;        // 0.05 - 0.10
  holdoutAssigned: boolean;
};

type SegmentMetrics = {
  exposedUsers: number;
  holdoutUsers: number;
  exposedConversions: number;
  holdoutConversions: number;
};

type Creative = {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'retire_suggested';
  baseShare: number;           // share of path contribution (mock)
  fatigue: number;             // 0-1, higher = more fatigue
  incrementalContribution: number; // computed
};

type BudgetIncreasePayload = { deltaPct: number; creativeId?: string };
type RetireCreativePayload = { creativeId?: string };

type Action =
  | { label: string; type: 'budget_increase'; payload: BudgetIncreasePayload }
  | { label: string; type: 'retire_creative'; payload: RetireCreativePayload };

type Brief = {
  weekOf: string;
  summary: string;
  actions: Action[];
  confidence: number; // 0..1
};

export default function RetentionProofLabPage() {
  // ===== Mock Campaign =====
  const [campaign, setCampaign] = useState<Campaign>({
    id: 'cmp-42',
    name: 'Loyalty Re-Engagement – Q4',
    audienceSize: 120_000,
    holdoutPct: 0,             // assigned on mount
    holdoutAssigned: false,
  });

  // ===== Mock Creatives =====
  const [creatives, setCreatives] = useState<Creative[]>([
    { id: 'cr1', name: 'Creative #1 – Welcome Back', status: 'active', baseShare: 0.42, fatigue: 0.18, incrementalContribution: 0 },
    { id: 'cr2', name: 'Creative #2 – 10% Off',      status: 'active', baseShare: 0.31, fatigue: 0.12, incrementalContribution: 0 },
    { id: 'cr3', name: 'Creative #3 – Free Shipping', status: 'active', baseShare: 0.20, fatigue: 0.35, incrementalContribution: 0 },
    { id: 'cr4', name: 'Creative #4 – Loyalty Points',status: 'active', baseShare: 0.07, fatigue: 0.05, incrementalContribution: 0 },
  ]);

  // ===== Assignment: micro-holdout 5–10% (random per campaign) =====
  useEffect(() => {
    if (!campaign.holdoutAssigned) {
      const pct = Math.round((Math.random() * (0.10 - 0.05) + 0.05) * 100) / 100; // 0.05..0.10
      setCampaign((c) => ({ ...c, holdoutPct: pct, holdoutAssigned: true }));
    }
  }, [campaign.holdoutAssigned]);

  // ===== Mock Segment Data (Exposed vs Holdout) =====
  const [segment, setSegment] = useState<SegmentMetrics>(() => {
    const exposedUsers = 30_000;
    const holdoutUsers = Math.floor(exposedUsers * 0.08);
    const exposedConversions = Math.floor(exposedUsers * 0.035); // 3.5%
    const holdoutConversions = Math.floor(holdoutUsers * 0.018); // 1.8%
    return { exposedUsers, holdoutUsers, exposedConversions, holdoutConversions };
  });

  // Re-sync holdout users if holdoutPct migrates after assignment
  useEffect(() => {
    setSegment((s) => {
      const holdoutUsers = Math.max(1, Math.floor(s.exposedUsers * (campaign.holdoutPct || 0.08)));
      const holdoutConversions = Math.max(0, Math.floor(holdoutUsers * 0.018));
      return { ...s, holdoutUsers, holdoutConversions };
    });
  }, [campaign.holdoutPct]);

  // ===== Incrementality (MVP) =====
  const incrementalConversions = Math.max(0, segment.exposedConversions - segment.holdoutConversions);
  const incrementalRate = segment.exposedUsers > 0 ? incrementalConversions / segment.exposedUsers : 0;
  const predictedLiftPct = 20;

  // ===== Simple path-based MTA + static MMM prior (mock) =====
  const MMM_PRIOR = 0.08; // small prior to avoid zeroing; optional MVP
  const creativesWithInc = useMemo(() => {
    const shareDenom = creatives.reduce((sum, c) => sum + c.baseShare, 0) + MMM_PRIOR;

    return creatives.map((c) => {
      const weight = (c.baseShare + MMM_PRIOR / creatives.length) / shareDenom;
      const adjusted = Math.max(0, weight * (1 - c.fatigue * 0.6)); // fatigue reduces contribution
      const inc = incrementalConversions * adjusted;
      return { ...c, incrementalContribution: inc };
    });
  }, [creatives, incrementalConversions]);

  // ===== Weekly Brief Generation (MVP, mock) =====
  const [brief, setBrief] = useState<Brief | null>(null);

  useEffect(() => {
    const topCreative = [...creativesWithInc].sort((a, b) => b.incrementalContribution - a.incrementalContribution)[0];
    const fatigued = [...creativesWithInc].sort((a, b) => b.fatigue - a.fatigue)[0];

    const sample = segment.exposedUsers + segment.holdoutUsers;
    const delta = incrementalRate; // proxy for separation
    let conf = Math.min(0.98, 0.6 + Math.tanh(sample / 50_000) * 0.3 + Math.min(0.08, delta));
    conf = Math.round(conf * 100) / 100;

    const actions: Action[] = [
      {
        label: `Raise budget +15% (top: ${topCreative?.name || 'N/A'})`,
        type: 'budget_increase',
        payload: { deltaPct: 0.15, creativeId: topCreative?.id },
      },
      {
        label: `Retire ${fatigued?.name || 'Creative'}`,
        type: 'retire_creative',
        payload: { creativeId: fatigued?.id },
      },
    ];

    const summary =
      `Incremental lift estimated at ${predictedLiftPct.toFixed(1)}%. ` +
      `Top performer: ${topCreative?.name ?? 'N/A'}. ` +
      `Underperforming (fatigue): ${fatigued?.name ?? 'N/A'}. ` +
      `Recommended actions prepared.`;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() || 7) + 1); // Monday
    setBrief({
      weekOf: weekStart.toISOString().slice(0, 10),
      summary,
      actions,
      confidence: conf,
    });
  }, [creativesWithInc, predictedLiftPct, incrementalRate, segment.exposedUsers, segment.holdoutUsers]);

  // ===== Status Indicator (Green / Yellow / Red) =====
  const status: 'green' | 'yellow' | 'red' = useMemo(() => {
    const underpowered = segment.exposedUsers < 10_000 || segment.holdoutUsers < 800;
    const negative = incrementalConversions < 0; // guarded by max(0)
    if (negative) return 'red';
    if (underpowered) return 'yellow';
    return 'green';
  }, [segment.exposedUsers, segment.holdoutUsers, incrementalConversions]);

  // ===== Action Buttons with Guardrails (confidence ≥ 0.90) =====
  const [actionLog, setActionLog] = useState<string[]>([]);

  const applyAction = (action: Action) => {
    if (!brief) return;
    if (brief.confidence < 0.9) {
      setActionLog((prev) => [
        `Blocked: "${action.label}" (confidence ${Math.round(brief.confidence * 100)}% < 90%)`,
        ...prev,
      ]);
      return;
    }
    if (action.type === 'budget_increase') {
      setActionLog((prev) => [`Applied: ${action.label}`, ...prev]);
      return;
    }
    if (action.type === 'retire_creative') {
      setCreatives((prev) =>
        prev.map((c) => (c.id === action.payload.creativeId ? { ...c, status: 'retire_suggested' } : c))
      );
      setActionLog((prev) => [`Applied: ${action.label}`, ...prev]);
    }
  };

  // ===== Tiny Bar Chart helper (incremental conversions vs holdout) =====
  // Replace your current BarChart with this responsive version
const BarChart = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState<number>(400); // will be measured
  const h = 120;

  // measure parent width
  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      setW(Math.max(240, containerRef.current.clientWidth)); // clamp a bit
    };
    measure();
    // use ResizeObserver for accuracy
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const bars = [
    { label: 'Exposed',     value: segment.exposedConversions,  color: 'text-gray-400' },
    { label: 'Holdout',     value: segment.holdoutConversions,  color: 'text-gray-600' },
    { label: 'Incremental', value: incrementalConversions,      color: 'text-green-400' },
  ];

  // inner padding & gap in px
  const padL = 16;
  const padR = 16; // change to 0 if you literally want bar to touch the box edge
  const padT = 16;
  const padB = 22;
  const gap = 12;

  const plotW = Math.max(1, w - padL - padR);
  const plotH = Math.max(1, h - padT - padB);

  const maxV = Math.max(1, ...bars.map(b => b.value));
  const n = bars.length;

  // bar width fills plotW exactly: n bars + (n-1) gaps
  const barW = (plotW - gap * (n - 1)) / n;

  return (
    <div ref={containerRef} className="w-full">
      <svg width={w} height={h} role="img" className="block">
        {/* background plate */}
        <rect x={0} y={0} width={w} height={h} className="fill-current text-gray-900" rx={8} />

        {bars.map((b, i) => {
          const x = padL + i * (barW + gap);
          const barH = (b.value / maxV) * plotH;
          const y = h - padB - barH;
          return (
            <g key={b.label}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={6}
                className={`fill-current ${b.color}`}
              />
              <text
                x={x + barW / 2}
                y={h - 6}
                textAnchor="middle"
                className="fill-current text-gray-400"
                fontSize={11}
              >
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};


  // ===== Responsive, data-driven spiky "Lift Over Time" =====
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(480);
  const CHART_HEIGHT = 180;

  useEffect(() => {
    const measure = () => {
      if (!chartContainerRef.current) return;
      const w = Math.max(320, Math.floor(chartContainerRef.current.clientWidth - 8));
      setChartWidth(w);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const [liftSeries, setLiftSeries] = useState<number[]>([]);
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  // === helpers to derive a data-driven mock trend ===
  const safeRate = (conv: number, users: number) => (users > 0 ? conv / users : 0);

  // observed baseline lift from page data (percentage points)
  const baselineLiftPct =
    (safeRate(segment.exposedConversions, segment.exposedUsers) -
      safeRate(segment.holdoutConversions, segment.holdoutUsers)) *
    100;

  // top creative share of incremental contribution (0..1)
  const topShare = useMemo(() => {
    const total = Math.max(1, incrementalConversions);
    const top = [...creativesWithInc].sort((a, b) => b.incrementalContribution - a.incrementalContribution)[0];
    return top ? top.incrementalContribution / total : 0;
  }, [creativesWithInc, incrementalConversions]);

  // average fatigue across creatives (0..1)
  const avgFatigue = useMemo(
    () => creatives.reduce((s, c) => s + c.fatigue, 0) / Math.max(1, creatives.length),
    [creatives]
  );

  // Rebuild a mock "spiky trend" whenever the underlying page data changes
  useEffect(() => {
    const weeks = 12;

    // anchor around the measured baseline or predicted lift
    const anchor =
      (isFinite(baselineLiftPct) && baselineLiftPct > 0 ? baselineLiftPct : undefined) ??
      (isFinite(predictedLiftPct) ? predictedLiftPct : 0) ??
      6;

    // slope guided by: more topShare -> stronger uptrend; more fatigue -> drag; incrementalRate nudges slope
    const slope =
      topShare * 6           // push up if one creative is truly pulling weight
      - avgFatigue * 3       // pull down with fatigue
      + incrementalRate * 40 // stronger incremental rate = stronger uptrend
      + 0.5;                 // tiny baseline upward drift

    const series: number[] = [];
    for (let i = 0; i < weeks; i++) {
      const trend = anchor + (i * slope) / 6;         // normalize slope a bit
      const wave  = Math.sin(i / 1.8) * 1.4;          // gentle weekly wave
      const bump  = i % 5 === 0 ? 1.5 : 0;            // periodic “campaign event”
      const jitter = (Math.random() - 0.5) * 0.8;     // small randomness
      series.push(Math.max(0, trend + wave + bump + jitter));
    }
    setLiftSeries(series);
  }, [
    baselineLiftPct,
    predictedLiftPct,
    incrementalRate,
    topShare,
    avgFatigue,
    creativesWithInc,
    segment.exposedUsers,
    segment.holdoutUsers,
    segment.exposedConversions,
    segment.holdoutConversions,
  ]);

  const appendWeek = () => {
    setLiftSeries(prev => {
      const i = prev.length;
      const anchor =
        (isFinite(baselineLiftPct) && baselineLiftPct > 0 ? baselineLiftPct : undefined) ??
        (isFinite(predictedLiftPct) ? predictedLiftPct : 0) ??
        6;
      const slope =
        topShare * 6 - avgFatigue * 3 + incrementalRate * 40 + 0.5;
      const trend = anchor + (i * slope) / 6;
      const jitter = (Math.random() - 0.5) * 0.8;
      const spike = Math.random() < 0.18 ? (Math.random() < 0.5 ? -1 : 1) * rand(2.5, 6.5) : 0;
      return [...prev, Math.max(0, trend + jitter + spike)];
    });
  };

  const LineChart = () => {
    const pad = 28;
    const width = chartWidth;
    const height = CHART_HEIGHT;

    const maxV = Math.max(1, ...liftSeries);
    const step = (width - pad * 2) / Math.max(1, liftSeries.length - 1);
    const x = (i: number) => pad + i * step;
    const y = (v: number) => height - pad - (v / maxV) * (height - pad * 2);

    const path = liftSeries.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
    const areaPath =
      liftSeries.length > 1
        ? `${path} L ${x(liftSeries.length - 1)} ${height - pad} L ${x(0)} ${height - pad} Z`
        : '';

    return (
      <div ref={chartContainerRef} className="w-full">
        <svg width={width} height={height} role="img" className="block">
          {/* background */}
          <rect x={0} y={0} width={width} height={height} className="fill-current text-gray-900" rx={8} />

          {/* grid lines */}
          {Array.from({ length: 4 }).map((_, i) => {
            const gy = pad + (i / 3) * (height - pad * 2);
            return (
              <line
                key={i}
                x1={pad}
                y1={gy}
                x2={width - pad}
                y2={gy}
                stroke="currentColor"
                className="text-gray-800"
                strokeWidth={1}
              />
            );
          })}

          {/* series area + line + points */}
          {liftSeries.length > 1 && (
            <path d={areaPath} className="fill-current text-green-900/25" />
          )}
          <path d={path} className="stroke-current text-green-400" fill="none" strokeWidth={2} />
          {liftSeries.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={3} className="fill-current text-green-300" />
          ))}

          {/* label */}
          <text x={pad} y={18} className="fill-current text-gray-400" fontSize={12}>
            Incremental Lift % (weekly)
          </text>
        </svg>

        {/* optional controls */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={appendWeek}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Add Week
          </button>
          <button
            onClick={() => setLiftSeries([])}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  return (
    <PageLayout title="Proof Lab™ – Retention Experiments">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Campaign Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
              <p className="text-gray-400 text-sm">
                Campaign ID: <span className="text-gray-300 font-mono">{campaign.id}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Test Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  status === 'green'
                    ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                    : status === 'yellow'
                    ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
                    : 'bg-red-900/30 text-red-400 border border-red-700/50'
                }`}
              >
                {status === 'green' ? 'Healthy' : status === 'yellow' ? 'Underpowered' : 'Negative'}
              </span>
            </div>
          </div>
        </div>

        {/* Holdout + Incrementality */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Holdout Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Holdout</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400">Audience Under Test</p>
                <p className="text-2xl font-bold text-white">{Math.round((campaign.holdoutPct || 0) * 100)}%</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-400">Total Audience</p>
                <p className="text-2xl font-bold text-white">{campaign.audienceSize.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-2">Users</p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-400">Exposed</p>
                  <p className="text-white font-semibold">{segment.exposedUsers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Holdout</p>
                  <p className="text-white font-semibold">{segment.holdoutUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conversions + Incremental */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Conversions</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400">Exposed</p>
                <p className="text-2xl font-bold text-white">{segment.exposedConversions.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400">Holdout</p>
                <p className="text-2xl font-bold text-white">{segment.holdoutConversions.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                <p className="text-xs text-gray-400">Incremental</p>
                <p className="text-2xl font-bold text-green-400">{incrementalConversions.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4">
              <BarChart />
            </div>
          </div>

          {/* Weekly Lift */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Lift Over Time</h3>
            <LineChart />
          </div>
        </div>

        {/* Weekly Brief + Actions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">Weekly Causal Brief</h3>
            <p className="text-sm text-gray-400">Week of {brief?.weekOf ?? '—'}</p>
          </div>
          <p className="text-gray-300 mb-4">{brief?.summary ?? 'Brief not available.'}</p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-400">Confidence:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              (brief?.confidence ?? 0) >= 0.9
                ? 'bg-green-900/30 text-green-400 border border-green-700/50'
                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50'
            }`}>
              {Math.round((brief?.confidence ?? 0) * 100)}%
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {brief?.actions.map((a, idx) => (
              <button
                key={idx}
                onClick={() => applyAction(a)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-semibold"
              >
                {a.label}
              </button>
            ))}
            {(!brief || brief.actions.length === 0) && (
              <span className="text-gray-400 text-sm">No actions recommended.</span>
            )}
          </div>

          {/* Action Log */}
          <div className="mt-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-300 mb-2">Transparency Log</p>
            {actionLog.length === 0 ? (
              <p className="text-gray-500 text-sm">No automated actions yet.</p>
            ) : (
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                {actionLog.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            )}
          </div>
        </div>

        {/* Creatives Table: active + incremental contribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Creatives – Incremental Contributions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="py-2 pr-4">Creative</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Path Share (mock)</th>
                  <th className="py-2 pr-4">Fatigue</th>
                  <th className="py-2 pr-4">Incremental Conversions</th>
                </tr>
              </thead>
              <tbody>
                {creativesWithInc.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800">
                    <td className="py-2 pr-4 text-white">{c.name}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          c.status === 'active'
                            ? 'bg-green-900/30 text-green-300'
                            : c.status === 'paused'
                            ? 'bg-yellow-900/30 text-yellow-300'
                            : 'bg-red-900/30 text-red-300'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-gray-300">{(c.baseShare * 100).toFixed(1)}%</td>
                    <td className="py-2 pr-4 text-gray-300">{Math.round(c.fatigue * 100)}%</td>
                    <td className="py-2 pr-4 text-green-400 font-semibold">{Math.round(c.incrementalContribution).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Attribution (MVP): path-based share with small MMM prior; fatigue reduces contribution.
          </p>
        </div>

        
      </div>
    </PageLayout>
  );
}
