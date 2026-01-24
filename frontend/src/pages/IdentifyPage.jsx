import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';
import ResultCard from '../components/ResultCard';
import { predictBreed } from '../services/api';
import { Camera, Info } from 'lucide-react';

export default function IdentifyPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [includeGradcam, setIncludeGradcam] = useState(true);

  const handleImageSelect = async (file, preview) => {
    setImagePreview(preview);
    setResult(null);
    setIsLoading(true);

    try {
      const response = await predictBreed(file, includeGradcam, true);
      setResult(response);
      toast.success('Breed identified successfully!');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error(error.message || 'Failed to identify breed');
      
      // Demo mode: show mock result if API fails
      setResult({
        success: true,
        animal_type: 'cattle',
        animal_type_confidence: 94.5,
        breed: 'gir',
        breed_confidence: 87.3,
        breed_hindi: 'गिर',
        top_predictions: [
          { breed: 'gir', confidence: 87.3 },
          { breed: 'sahiwal', confidence: 8.2 },
          { breed: 'red_sindhi', confidence: 2.1 }
        ],
        gradcam_image: null,
        breed_info: {
          name: 'Gir',
          nameHindi: 'गिर',
          nativeState: ['Gujarat'],
          productivity: {
            milkYieldPerDay: '12-15 liters'
          },
          sustainability: {
            carbonScore: 85
          },
          population: {
            conservationStatus: 'Not Endangered'
          },
          funFact: 'Gir cattle have been exported to Brazil, where they adapted so well that Brazil now has the largest Gir population outside India.'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetIdentification = () => {
    setResult(null);
    setImagePreview(null);
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Camera size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t('upload.title')}
          </h1>
          <p className="mt-2 text-gray-600 max-w-lg mx-auto">
            Upload an image of a cattle or buffalo to identify its breed using our AI model
          </p>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-center space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGradcam}
                onChange={(e) => setIncludeGradcam(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include AI Explainability (Grad-CAM)</span>
            </label>
          </div>
        </motion.div>

        {/* Upload Section */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ImageUpload onImageSelect={handleImageSelect} isLoading={isLoading} />
            
            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-start space-x-3">
                <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Tips for best results:</p>
                  <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                    <li>Ensure the animal is clearly visible</li>
                    <li>Good lighting improves accuracy</li>
                    <li>Side or front view works best</li>
                    <li>Avoid blurry or distant shots</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ResultCard result={result} imagePreview={imagePreview} />
            
            {/* New Identification Button */}
            <div className="mt-6 text-center">
              <button
                onClick={resetIdentification}
                className="btn-secondary"
              >
                Identify Another Image
              </button>
            </div>
          </motion.div>
        )}

        {/* Demo Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 bg-gray-50 rounded-xl text-center"
        >
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> This is a demo application. Connect to the backend API for real predictions.
            Currently showing sample results for demonstration purposes.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
