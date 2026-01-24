import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Upload, Image, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUpload({ onImageSelect, isLoading }) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload JPG, PNG, or WebP.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = () => {
        setPreview(reader.result);
        onImageSelect(file, reader.result);
      };
      
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isLoading
  });

  const clearImage = () => {
    setPreview(null);
    setError(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center space-y-4">
                <div className={`p-4 rounded-full ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Upload 
                    size={40} 
                    className={isDragActive ? 'text-primary-600' : 'text-gray-400'} 
                  />
                </div>
                
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {t('upload.dragDrop')}
                  </p>
                  <p className="text-gray-500 mt-1">{t('upload.or')}</p>
                  <button className="mt-2 text-primary-600 font-semibold hover:text-primary-700">
                    {t('upload.browse')}
                  </button>
                </div>
                
                <p className="text-sm text-gray-400">
                  {t('upload.formats')}
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 left-4 text-4xl opacity-20">🐄</div>
              <div className="absolute bottom-4 right-4 text-4xl opacity-20">🐃</div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 md:h-80 object-cover"
              />
              
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 size={48} className="animate-spin mx-auto mb-2" />
                    <p className="font-medium">{t('upload.analyzing')}</p>
                  </div>
                </div>
              )}

              {!isLoading && (
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
