'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    // Add logout logic here
    router.push('/');
  };

  const menuItems = [
    { name: 'Home', href: '/home' },
    { name: 'Onboarding and Data Foundation', href: '/onboarding' },
    { name: 'Targeting and Audience', href: '/targeting' },
    { name: 'Creative and Experience', href: '/creative' },
    { name: 'Campaign Automation and Efficiency', href: '/campaign' },
    { name: 'Retention and Customer Marketing', href: '/retention' },
    { name: 'Measurement and Insight', href: '/measurement' },
    { name: 'Compliance, Privacy, and Brand Safety', href: '/privacy' },
    { name: 'Sustainability and Cost Efficiency', href: '/sustainability' },
    { name: 'Admin, Roles, and Support', href: '/admin' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold text-green-500">SustainAd</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors text-sm"
            >
              <span className={sidebarOpen ? '' : 'text-center w-full'}>
                {sidebarOpen ? item.name : item.name[0]}
              </span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-semibold"
          >
            {sidebarOpen ? 'Logout' : '⏻'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-500">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Welcome back!</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to SustainAd!</h2>
            <p className="text-gray-400 text-lg mb-8">You&apos;re now logged in.</p>

            {/* Content Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </div>
      </main>
    </div>
  );
}