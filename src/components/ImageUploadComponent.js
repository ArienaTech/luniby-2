import React, { useCallback } from 'react';

const ImageUploadComponent = ({ 
  onImageUpload, 
  isAnalyzing, 
  disabled,
  fileInputRef 
}) => {
  
  // Performance: Memoized image compression
  const compressImage = useCallback((file, maxWidth = 1024, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          // Compress image for better performance
          const compressedFile = await compressImage(file);
          const reader = new FileReader();
          
          reader.onload = (e) => {
            const base64Data = e.target.result;
            onImageUpload({
              file: compressedFile,
              base64: base64Data,
              fileName: file.name,
              originalSize: file.size,
              compressedSize: compressedFile?.size || file.size
            });
          };
          
          reader.readAsDataURL(compressedFile || file);
        } catch (error) {
          console.error('Image compression failed:', error);
          // Fallback to original file
          const reader = new FileReader();
          reader.onload = (e) => {
            onImageUpload({
              file,
              base64: e.target.result,
              fileName: file.name,
              originalSize: file.size,
              compressedSize: file.size
            });
          };
          reader.readAsDataURL(file);
        }
      }
    }
    
    // Clear the input
    event.target.value = '';
  }, [compressImage, onImageUpload]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
        disabled={disabled || isAnalyzing}
      />
      <button
        onClick={() => fileInputRef?.current?.click()}
        disabled={disabled || isAnalyzing}
        className={`p-2 rounded-lg transition-colors ${
          disabled || isAnalyzing
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isAnalyzing ? "Analyzing image..." : "Upload image"}
      >
        {isAnalyzing ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ImageUploadComponent;