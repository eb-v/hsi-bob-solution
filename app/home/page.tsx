'use client';

import PageLayout from '@/app/components/PageLayout';
import Link from 'next/link';

export default function Home() {
  return (
    <PageLayout title="Dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header area */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Welcome to SustAInAd!</h2>
          <p className="text-gray-400 text-lg">You&apos;re now logged in.</p>
        </div>

        {/* Quick actions / cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2">Quick Stats</h3>
            <p className="text-gray-400">View your dashboard statistics</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2">Recent Activity</h3>
            <p className="text-gray-400">Check your latest updates</p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-green-500 transition-colors">
            <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
            <p className="text-gray-400">Manage your preferences</p>
          </div>
        </div>

        {/* Primary navigation tiles (optional, mirrors your sidebar routes) */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Explore</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Onboarding and Data Foundation', href: '/onboarding' },
              { name: 'Targeting and Audience', href: '/targeting' },
              { name: 'Creative and Experience', href: '/creative' },
              { name: 'Campaign Automation and Efficiency', href: '/campaign' },
              { name: 'Retention and Customer Marketing', href: '/retention' },
              { name: 'Measurement and Insight', href: '/measurement' },
              { name: 'Compliance, Privacy, and Brand Safety', href: '/privacy' },
              { name: 'Sustainability and Cost Efficiency', href: '/sustainability' },
              { name: 'Admin, Roles, and Support', href: '/admin' },
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-green-500 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
