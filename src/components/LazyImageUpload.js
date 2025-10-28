import React, { lazy, Suspense } from 'react';

// Lazy load the image upload component for better performance
const ImageUploadComponent = lazy(() => import('./ImageUploadComponent'));

const LazyImageUpload = (props) => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading image upload...</span>
      </div>
    }>
      <ImageUploadComponent {...props} />
    </Suspense>
  );
};

export default LazyImageUpload;