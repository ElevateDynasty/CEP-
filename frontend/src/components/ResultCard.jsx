import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Volume2, 
  Eye, 
  EyeOff, 
  Leaf, 
  TrendingUp,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Award
} from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

export default function ResultCard({ result, imagePreview }) {
  const { t, i18n } = useTranslation();
  const [showGradcam, setShowGradcam] = useState(false);
  const { speak, speaking } = useSpeechSynthesis();

  const {
    animal_type,
    animal_type_confidence,
    breed,
    breed_confidence,
    breed_hindi,
    top_predictions,
    gradcam_image,
    breed_info
  } = result;

  const speakResult = () => {
    const lang = i18n.language;
    let text;
    
    if (lang === 'hi') {
      text = `यह ${animal_type === 'cattle' ? 'गाय' : 'भैंस'} है। 
              नस्ल ${breed_hindi || breed} है। 
              विश्वास स्तर ${Math.round(breed_confidence)} प्रतिशत है।`;
      if (breed_info?.funFact) {
        text += ` रोचक तथ्य: ${breed_info.funFact}`;
      }
    } else {
      text = `This is a ${animal_type}. 
              The breed is ${breed}. 
              Confidence level is ${Math.round(breed_confidence)} percent.`;
      if (breed_info?.funFact) {
        text += ` Fun fact: ${breed_info.funFact}`;
      }
    }
    
    speak(text, lang === 'hi' ? 'hi-IN' : 'en-US');
  };

  const getConservationColor = (status) => {
    if (!status) return 'gray';
    const lower = status.toLowerCase();
    if (lower.includes('critical')) return 'red';
    if (lower.includes('endangered')) return 'orange';
    if (lower.includes('vulnerable')) return 'yellow';
    return 'green';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle size={28} />
            <h2 className="text-xl font-bold">{t('result.title')}</h2>
          </div>
          <button
            onClick={speakResult}
            disabled={speaking}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              speaking 
                ? 'bg-white/30 cursor-not-allowed' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            <Volume2 size={18} className={speaking ? 'animate-pulse' : ''} />
            <span className="text-sm font-medium">{t('result.speakResult')}</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Image with Grad-CAM toggle */}
        <div className="relative mb-6 rounded-xl overflow-hidden">
          <img
            src={showGradcam && gradcam_image ? gradcam_image : imagePreview}
            alt="Analyzed"
            className="w-full h-48 md:h-64 object-cover"
          />
          
          {gradcam_image && (
            <button
              onClick={() => setShowGradcam(!showGradcam)}
              className="absolute bottom-3 right-3 flex items-center space-x-2 px-3 py-2 bg-black/70 text-white rounded-lg text-sm hover:bg-black/80 transition-colors"
            >
              {showGradcam ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showGradcam ? t('result.hideGradcam') : t('result.showGradcam')}</span>
            </button>
          )}
        </div>

        {/* Main Result */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Animal Type */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">{t('result.animalType')}</p>
            <div className="flex items-center space-x-2">
              <span className="text-3xl">{animal_type === 'cattle' ? '🐄' : '🐃'}</span>
              <span className="text-xl font-bold text-gray-800 capitalize">{animal_type}</span>
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">{t('result.confidence')}</span>
                <span className="font-medium text-gray-700">{animal_type_confidence}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${animal_type_confidence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Breed */}
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-sm text-primary-600 mb-1">{t('result.breed')}</p>
            <div>
              <span className="text-xl font-bold text-primary-800 capitalize">{breed.replace(/_/g, ' ')}</span>
              {breed_hindi && (
                <span className="block text-lg text-primary-600 font-hindi">{breed_hindi}</span>
              )}
            </div>
            <div className="mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary-600">{t('result.confidence')}</span>
                <span className="font-medium text-primary-700">{breed_confidence}%</span>
              </div>
              <div className="h-2 bg-primary-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${breed_confidence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-primary-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Predictions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('result.topPredictions')}</h3>
          <div className="space-y-2">
            {top_predictions.map((pred, idx) => (
              <div key={pred.breed} className="flex items-center space-x-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  idx === 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {idx + 1}
                </span>
                <span className="flex-grow capitalize text-gray-700">{pred.breed.replace(/_/g, ' ')}</span>
                <span className="text-sm font-medium text-gray-500">{pred.confidence}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Breed Info Summary */}
        {breed_info && (
          <div className="border-t pt-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Native Region */}
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <MapPin size={20} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">{t('breed.nativeRegion')}</p>
                <p className="text-sm font-medium text-gray-700">
                  {breed_info.nativeState?.join(', ') || 'N/A'}
                </p>
              </div>

              {/* Sustainability */}
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <Leaf size={20} className="mx-auto text-green-500 mb-1" />
                <p className="text-xs text-gray-500">Carbon Score</p>
                <p className="text-sm font-bold text-green-600">
                  {breed_info.sustainability?.carbonScore || 'N/A'}/100
                </p>
              </div>

              {/* Milk Yield */}
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <TrendingUp size={20} className="mx-auto text-blue-500 mb-1" />
                <p className="text-xs text-gray-500">{t('compare.milkYield')}</p>
                <p className="text-sm font-medium text-blue-600">
                  {breed_info.productivity?.milkYieldPerDay || 'N/A'}
                </p>
              </div>

              {/* Conservation */}
              <div className={`text-center p-3 rounded-xl bg-${getConservationColor(breed_info.population?.conservationStatus)}-50`}>
                {breed_info.population?.conservationStatus?.toLowerCase().includes('endangered') ? (
                  <AlertTriangle size={20} className="mx-auto text-orange-500 mb-1" />
                ) : (
                  <Award size={20} className="mx-auto text-green-500 mb-1" />
                )}
                <p className="text-xs text-gray-500">{t('breed.conservation')}</p>
                <p className="text-sm font-medium">
                  {breed_info.population?.conservationStatus || 'N/A'}
                </p>
              </div>
            </div>

            {/* Fun Fact */}
            {breed_info.funFact && (
              <div className="bg-accent-50 border border-accent-100 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-accent-700 mb-1">💡 {t('breed.funFact')}</p>
                <p className="text-gray-700">{breed_info.funFact}</p>
              </div>
            )}

            {/* View More Link */}
            <Link
              to={`/breed/${breed}`}
              className="flex items-center justify-center space-x-2 w-full py-3 bg-primary-50 text-primary-700 rounded-xl font-medium hover:bg-primary-100 transition-colors"
            >
              <span>{t('common.learnMore')}</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
