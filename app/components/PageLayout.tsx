'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  UserPlus, 
  Target, 
  Palette, 
  Zap, 
  Users, 
  BarChart3, 
  Shield, 
  Leaf, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    router.push('/');
  };

  const menuItems = [
    { name: 'Home', href: '/home', icon: Home },
    { name: 'Onboarding and Data Foundation', href: '/onboarding', icon: UserPlus },
    { name: 'Targeting and Audience', href: '/targeting', icon: Target },
    { name: 'Creative and Experience', href: '/creative', icon: Palette },
    { name: 'Campaign Automation and Efficiency', href: '/campaign', icon: Zap },
    { name: 'Retention and Customer Marketing', href: '/retention', icon: Users },
    { name: 'Measurement and Insight', href: '/measurement', icon: BarChart3 },
    { name: 'Compliance, Privacy, and Brand Safety', href: '/privacy', icon: Shield },
    { name: 'Sustainability and Cost Efficiency', href: '/sustainability', icon: Leaf },
    { name: 'Admin, Roles, and Support', href: '/admin', icon: Settings },
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
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors text-sm group"
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors font-semibold"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <nav className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-green-500">{title}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Welcome back!</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}