'use client';

import { useMemo, useState } from 'react';
import PageLayout from '@/app/components/PageLayout';

type CreativeType = 'Image' | 'GIF' | 'Video';

type Creative = {
  id: string;
  name: string;
  type: CreativeType;
  computeWeight: 1 | 2 | 3; // Light, Medium, Heavy
  performanceScore: number;  // 0-100 (mock CTR/conv lift proxy)
  impressions: number;
  clicks: number;
  conversions: number;
};

type LogEntry = {
  ts: string;
  text: string;
};

export default function SustainabilityPage() {
  // ======= Slider UI (Performance ↔ Greener Mix) =======
  const [sliderValue, setSliderValue] = useState<number>(50); // Stored in "campaign settings"

  // ======= Creative Tagging (Light/Medium/Heavy) + Mock Data =======
  const [creatives, setCreatives] = useState<Creative[]>([
    {
      id: 'c1',
      name: 'Spring Promo (IMG)',
      type: 'Image',
      computeWeight: 1,          // Light
      performanceScore: 64,
      // Prefilled historical-looking numbers (list display only)
      impressions: 4800,
      clicks: 72,                // ~1.5% CTR
      conversions: 14,           // ~0.29% conv rate
    },
    {
      id: 'c2',
      name: 'Summer Loop (GIF)',
      type: 'GIF',
      computeWeight: 2,          // Medium
      performanceScore: 72,
      impressions: 3600,
      clicks: 65,                // ~1.8% CTR
      conversions: 10,           // ~0.28% conv rate
    },
    {
      id: 'c3',
      name: 'Brand Story (VIDEO)',
      type: 'Video',
      computeWeight: 3,          // Heavy
      performanceScore: 88,
      impressions: 0,
      clicks: 0,                // ~3.0% CTR
      conversions: 0,           // ~0.83% conv rate
    },
  ]);


  // Simple add-creative form (fixed rules, not ML)
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CreativeType>('Image');
  const [newPerf, setNewPerf] = useState<number>(70);

  const typeToWeight: Record<CreativeType, 1 | 2 | 3> = {
    Image: 1,
    GIF: 2,
    Video: 3,
  };

  const weightLabel = (w: 1 | 2 | 3) =>
    w === 1 ? 'Light' : w === 2 ? 'Medium' : 'Heavy';

  const addCreative = () => {
    if (!newName.trim()) return;
    const weight = typeToWeight[newType];
    setCreatives(prev => [
      ...prev,
      {
        id: `c${prev.length + 1}`,
        name: newName.trim(),
        type: newType,
        computeWeight: weight,
        performanceScore: Math.max(1, Math.min(100, newPerf)),
        impressions: 0, clicks: 0, conversions: 0,
      },
    ]);
    setNewName('');
    setNewType('Image');
    setNewPerf(70);
  };

  // ======= Carbon Score (Simple Calculation) =======
  // carbon_score = compute_weight × slider_value / 100
  const carbonScore = (computeWeight: number) =>
    (computeWeight * sliderValue) / 100;

  // ======= Optimizer Logic (final_score = performance_score – carbon_score) =======
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serveHistory, setServeHistory] = useState<
    { serveIndex: number; cpa: number; carbonIntensity: number }[]
  >([]);

  // Campaign aggregates (mock economics)
  const [spend, setSpend] = useState<number>(0);      // mock spend
  const [revenue, setRevenue] = useState<number>(0);  // mock revenue
  const [impressions, setImpressions] = useState<number>(0);
  const [clicks, setClicks] = useState<number>(0);
  const [conversions, setConversions] = useState<number>(0);
  const [totalCO2g, setTotalCO2g] = useState<number>(0); // grams CO2

  // CO2 per impression per weight (mock factors)
  const co2PerImpressionByWeight: Record<1 | 2 | 3, number> = {
    1: 0.2,  // Image: 0.2 gCO2 / imp
    2: 0.6,  // GIF:   0.6 gCO2 / imp
    3: 2.0,  // Video: 2.0 gCO2 / imp
  };

  // Mock economics per impression served (for demo)
  const spendPerImpression = 0.15; // $0.15 CPM proxy (not realistic; demo only)
  const revenuePerConversion = 30; // $30 per conversion (demo)

  // Decide which creative to serve next
  const serveImpression = () => {
  if (creatives.length === 0) return;

  // 1) Score each creative normally
  const scored = creatives.map((cr) => {
    const cPenalty = carbonScore(cr.computeWeight);
    const final = cr.performanceScore - cPenalty;
    return { cr, final, cPenalty };
  });
  scored.sort((a, b) => b.final - a.final);
  const winner = scored[0].cr;
  const winnerPenalty = scored[0].cPenalty;

  // 2) Baseline CO₂ comparison (unchanged)
  const heaviest = [...creatives].sort((a, b) => b.computeWeight - a.computeWeight)[0];
  const winnerCO2 = co2PerImpressionByWeight[winner.computeWeight];
  const heaviestCO2 = co2PerImpressionByWeight[heaviest.computeWeight];
  const co2ReductionPct = heaviestCO2 > 0 ? Math.round(((heaviestCO2 - winnerCO2) / heaviestCO2) * 100) : 0;

  // 3) Add light randomness to outcome so performance wiggles per-serve
  // Base expected values
  const baseClickAdd = winner.performanceScore * 0.003;    // as before
  const baseConvAdd  = winner.performanceScore * 0.0012;

  // Random small wiggle (~±20%)
  const wiggle = (range = 0.2) => 1 + (Math.random() * 2 - 1) * range;

  // Occasional spike events (e.g., delivery hiccup or surge)
  const spikeProbability = 0.12;  // 12% of serves cause a visible spike
  const spikeHappened = Math.random() < spikeProbability;
  // If spike: either conversions dip OR spend surges (randomly choose one)
  const negativeConvSpike = spikeHappened && Math.random() < 0.5;
  const spendSpike        = spikeHappened && !negativeConvSpike;

  const clickAdd = baseClickAdd * wiggle(0.2);
  const convAdd  = Math.max(0, baseConvAdd * (negativeConvSpike ? 0.2 : wiggle(0.2)));

  // 4) Update creative metrics
  setCreatives(prev => prev.map(cr =>
    cr.id === winner.id
      ? {
          ...cr,
          impressions: cr.impressions + 1,
          clicks: cr.clicks + clickAdd,
          conversions: cr.conversions + convAdd,
        }
      : cr
  ));

  // 5) Update campaign aggregates
  // Add mild volatility to spend per impression; big pop on spike
  const spendThisImp = spendPerImpression * (spendSpike ? 2.2 : wiggle(0.1));
  const newImps = impressions + 1;
  const newClicks = clicks + clickAdd;
  const newConvs = conversions + convAdd;
  const newSpend = spend + spendThisImp;
  const newRevenue = revenue + (convAdd * revenuePerConversion);
  const newTotalCO2 = totalCO2g + winnerCO2;

  setImpressions(newImps);
  setClicks(newClicks);
  setConversions(newConvs);
  setSpend(newSpend);
  setRevenue(newRevenue);
  setTotalCO2g(newTotalCO2);

  // 6) Transparency log (unchanged)
  const ts = new Date().toLocaleString();
  const text = `Picked ${winner.type} (${weightLabel(winner.computeWeight)}). Final score: ${(
    winner.performanceScore - winnerPenalty
  ).toFixed(2)} = perf ${winner.performanceScore.toFixed(1)} – carbon ${winnerPenalty.toFixed(2)}. Estimated CO₂ reduced by ~${co2ReductionPct}% vs heaviest alternative.${spikeHappened ? ' (Spike event occurred)' : ''}`;
  setLogs(prev => [{ ts, text }, ...prev].slice(0, 200));

  // 7) Push a *display* point with spiky noise (doesn't affect true aggregates)
  const trueCPA = newConvs > 0 ? newSpend / newConvs : newSpend;
  const trueCarbonIntensity = newImps > 0 ? newTotalCO2 / newImps : 0;

  // Display spikes: add larger ± noise + extra pop on spike
  const cpaDisplay = trueCPA * (spikeHappened ? 1 + (Math.random() * 0.9 + 0.3) : wiggle(0.25));
  const carbonDisplay = trueCarbonIntensity * (spikeHappened ? 1 + (Math.random() * 0.7 + 0.2) : wiggle(0.2));

  setServeHistory(prev => [
    ...prev,
    {
      serveIndex: prev.length + 1,
      cpa: Math.max(0, cpaDisplay),
      carbonIntensity: Math.max(0, carbonDisplay),
    },
  ]);
};


  // Derived reporting
  const avgCPA = useMemo(() => (conversions > 0 ? spend / conversions : 0), [spend, conversions]);
  const avgROAS = useMemo(() => (spend > 0 ? revenue / spend : 0), [revenue, spend]);
  const gCO2PerConversion = useMemo(() => (conversions > 0 ? totalCO2g / conversions : totalCO2g), [totalCO2g, conversions]);

  // ======= Simple Line Chart (SVG) for CPA vs Carbon Intensity =======
  const chartWidth = 640;
  const chartHeight = 220;
  const padding = 36;

  const maxCPA = Math.max(1, ...serveHistory.map(d => d.cpa));
  const maxCarbon = Math.max(1, ...serveHistory.map(d => d.carbonIntensity));
  const maxX = Math.max(1, ...serveHistory.map(d => d.serveIndex));

  const xScale = (x: number) =>
    padding + ((x - 1) / Math.max(1, maxX - 1)) * (chartWidth - padding * 2);

  const yScaleLeft = (y: number) =>
    chartHeight - padding - (y / maxCPA) * (chartHeight - padding * 2);

  const yScaleRight = (y: number) =>
    chartHeight - padding - (y / maxCarbon) * (chartHeight - padding * 2);

  const cpaPath = useMemo(() => {
    if (serveHistory.length === 0) return '';
    return serveHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.serveIndex)} ${yScaleLeft(d.cpa)}`)
      .join(' ');
  }, [serveHistory, maxCPA, maxX]);

  const carbonPath = useMemo(() => {
    if (serveHistory.length === 0) return '';
    return serveHistory
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(d.serveIndex)} ${yScaleRight(d.carbonIntensity)}`)
      .join(' ');
  }, [serveHistory, maxCarbon, maxX]);

  return (
    <PageLayout title="Sustainability & Cost Efficiency">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ====== Header / Intro ====== */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Carbon ROAS Optimizer</h2>
          <p className="text-gray-400">
            MVP: Balance ad performance with a greener creative mix using a simple, transparent scoring approach.
          </p>
        </div>

        {/* ====== Slider UI Card ====== */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Optimizer Setting</h3>
            <span className="text-green-400 font-semibold">{sliderValue}</span>
          </div>
          <label className="block text-sm text-gray-300 mb-2">Performance ↔ Greener Mix</label>
          <input
            type="range"
            min={0}
            max={100}
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Performance</span>
            <span>Balanced</span>
            <span>Greener Mix</span>
          </div>
        </div>

        {/* ====== Creatives Management (Tagging + List) ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Creative */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Add Creative (MVP rules)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Holiday Teaser"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as CreativeType)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Image</option>
                  <option>GIF</option>
                  <option>Video</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Compute Weight: {typeToWeight[newType]} ({weightLabel(typeToWeight[newType])})
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Performance Score (0-100)</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newPerf}
                  onChange={(e) => setNewPerf(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={addCreative}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold"
                >
                  Add Creative
                </button>
              </div>
            </div>
          </div>

          {/* Creative List */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Creatives</h3>
              <button
                onClick={serveImpression}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold"
              >
                Serve Impression
              </button>
            </div>

            <div className="space-y-3">
              {creatives.map((cr) => (
                <div
                  key={cr.id}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{cr.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">
                        {cr.type}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-200">
                        {weightLabel(cr.computeWeight)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Perf Score: {cr.performanceScore} · Carbon Penalty now:{' '}
                      {(carbonScore(cr.computeWeight)).toFixed(2)} · Final:{' '}
                      {(cr.performanceScore - carbonScore(cr.computeWeight)).toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-400">Impr.</p>
                      <p className="text-white font-semibold">{cr.impressions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Clicks</p>
                      <p className="text-white font-semibold">{cr.clicks.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Conv.</p>
                      <p className="text-white font-semibold">{cr.conversions.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">gCO₂/imp</p>
                      <p className="text-white font-semibold">
                        {co2PerImpressionByWeight[cr.computeWeight].toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {creatives.length === 0 && (
                <p className="text-gray-400 text-sm">No creatives yet. Add one on the left.</p>
              )}
            </div>
          </div>
        </div>

        {/* ====== Analytics / Reporting ====== */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Carbon Report (MVP)</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-400">Avg CPA</p>
              <p className="text-2xl font-bold text-white">${avgCPA.toFixed(2)}</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-400">Avg ROAS</p>
              <p className="text-2xl font-bold text-white">{avgROAS.toFixed(2)}×</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-400">Est. gCO₂ / Conversion</p>
              <p className="text-2xl font-bold text-white">{gCO2PerConversion.toFixed(2)} g</p>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-400">Impressions</p>
              <p className="text-2xl font-bold text-white">{impressions}</p>
            </div>
          </div>

          {/* Line chart: CPA (left axis) vs Carbon Intensity (right axis) */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-x-auto">
            <h4 className="text-white font-semibold mb-2">CPA vs Carbon Intensity (per serve)</h4>
            <svg width={chartWidth} height={chartHeight} role="img">
              {/* Axes */}
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" className="text-gray-700" />
              <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="currentColor" className="text-gray-700" />
              <line x1={chartWidth - padding} y1={padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="currentColor" className="text-gray-700" />

              {/* CPA path (left axis) */}
              <path d={cpaPath} fill="none" stroke="currentColor" className="text-green-400" strokeWidth={2} />
              {/* Carbon path (right axis) */}
              <path d={carbonPath} fill="none" stroke="currentColor" className="text-gray-300" strokeWidth={2} strokeDasharray="4 4" />

              {/* Labels */}
              <text x={padding} y={20} className="fill-current text-gray-400" fontSize="12">
                CPA (left)
              </text>
              <text x={chartWidth - padding - 80} y={20} className="fill-current text-gray-400" fontSize="12">
                Carbon Intensity (right)
              </text>
            </svg>

            {serveHistory.length === 0 && (
              <p className="text-gray-400 text-sm mt-2">No data yet. Click “Serve Impression” to generate points.</p>
            )}
          </div>
        </div>

        {/* ====== Transparency Logs ====== */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Transparency Logs</h3>
            <button
              onClick={() => setLogs([])}
              className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {logs.map((l, idx) => (
              <div key={`${l.ts}-${idx}`} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500">{l.ts}</p>
                <p className="text-sm text-gray-200">{l.text}</p>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-gray-400 text-sm">Logs will appear here after serving impressions.</p>
            )}
          </div>
        </div>

        
      </div>
    </PageLayout>
  );
}
