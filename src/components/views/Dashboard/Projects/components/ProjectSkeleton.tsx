import React from 'react';

export const ProjectSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center p-4 border border-gray-100 rounded-xl animate-pulse">
        <div className="h-12 w-12 bg-gray-200 rounded-lg mr-4"></div>
        <div className="flex-1">
          <div className="h-5 w-1/4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);
