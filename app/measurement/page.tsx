'use client';

import PageLayout from '@/app/components/PageLayout';

export default function BlankPage() {
  return (
    <PageLayout title="Page Title">
      <div className="max-w-6xl mx-auto">
        {/* Empty content area */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
          <p className="text-gray-400">This section is currently blank.</p>
        </div>
      </div>
    </PageLayout>
  );
}
