import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Droplets, 
  Leaf, 
  IndianRupee,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import breedData from '../data/breedData';

export default function BreedDetailPage() {
  const { breedId } = useParams();
  const { t, i18n } = useTranslation();
  const { speak, speaking } = useSpeechSynthesis();

  // Find breed in data
  let breed = null;
  let animalType = null;

  if (breedData.cattle?.[breedId]) {
    breed = breedData.cattle[breedId];
    animalType = 'cattle';
  } else if (breedData.buffalo?.[breedId]) {
    breed = breedData.buffalo[breedId];
    animalType = 'buffalo';
  }

  if (!breed) {
    return (
      <div className="py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Breed not found</h1>
        <Link to="/explore" className="text-primary-600 hover:underline mt-4 inline-block">
          ← Back to Explore
        </Link>
      </div>
    );
  }

  const speakBreedInfo = () => {
    const lang = i18n.language;
    let text;
    
    if (lang === 'hi' && breed.nameHindi) {
      text = `${breed.nameHindi}। यह ${breed.nativeState?.join(', ')} की देशी नस्ल है। 
              दूध उत्पादन ${breed.productivity?.milkYieldPerDay || 'उपलब्ध नहीं'} है।
              ${breed.funFact || ''}`;
    } else {
      text = `${breed.name}. This is a native breed from ${breed.nativeState?.join(', ')}.
              Daily milk yield is ${breed.productivity?.milkYieldPerDay || 'not available'}.
              ${breed.funFact || ''}`;
    }
    
    speak(text, lang === 'hi' ? 'hi-IN' : 'en-US');
  };

  const getTrendIcon = (trend) => {
    if (trend === 'positive') return <TrendingUp className="text-green-500" size={16} />;
    if (trend === 'negative') return <TrendingDown className="text-red-500" size={16} />;
    return null;
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link
          to="/explore"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>{t('common.back')}</span>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-6xl">{animalType === 'cattle' ? '🐄' : '🐃'}</span>
                <div>
                  <h1 className="text-3xl font-bold">{breed.name}</h1>
                  {breed.nameHindi && (
                    <p className="text-xl text-primary-100 font-hindi">{breed.nameHindi}</p>
                  )}
                  <p className="text-primary-200 capitalize">{animalType}</p>
                </div>
              </div>
              <button
                onClick={speakBreedInfo}
                disabled={speaking}
                className={`p-3 rounded-full transition-colors ${
                  speaking ? 'bg-white/30' : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <Volume2 size={24} className={speaking ? 'animate-pulse' : ''} />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Native Region */}
            <div className="flex items-start space-x-3 mb-4">
              <MapPin className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <p className="text-sm text-gray-500">{t('breed.nativeRegion')}</p>
                <p className="font-medium text-gray-900">{breed.nativeState?.join(', ')}</p>
                <p className="text-sm text-gray-600">{breed.nativeRegion}</p>
              </div>
            </div>

            {/* Fun Fact */}
            {breed.funFact && (
              <div className="bg-accent-50 border border-accent-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-accent-700 mb-1">💡 {t('breed.funFact')}</p>
                <p className="text-gray-700">{breed.funFact}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Characteristics */}
        {breed.characteristics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('breed.characteristics')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(breed.characteristics).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Productivity */}
        {breed.productivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Droplets className="text-blue-500" />
              <span>{t('breed.productivity')}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{breed.productivity.milkYieldPerDay}</p>
                <p className="text-sm text-gray-600">Daily Yield</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{breed.productivity.lactationYield}</p>
                <p className="text-sm text-gray-600">Lactation Yield</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{breed.productivity.fatContent}</p>
                <p className="text-sm text-gray-600">Fat Content</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-2xl font-bold text-blue-600">{breed.productivity.lactationPeriod}</p>
                <p className="text-sm text-gray-600">Lactation Period</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Sustainability */}
        {breed.sustainability && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Leaf className="text-green-500" />
              <span>{t('breed.sustainability')}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{breed.sustainability.carbonScore}<span className="text-lg">/100</span></p>
                <p className="text-sm text-gray-600">Carbon Score</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.sustainability.carbonFootprint}</p>
                <p className="text-sm text-gray-600">Carbon Footprint</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.sustainability.heatTolerance}</p>
                <p className="text-sm text-gray-600">Heat Tolerance</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.sustainability.diseaseResistance}</p>
                <p className="text-sm text-gray-600">Disease Resistance</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.sustainability.feedEfficiency}</p>
                <p className="text-sm text-gray-600">Feed Efficiency</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.sustainability.climateAdaptability}</p>
                <p className="text-sm text-gray-600">Climate Adaptability</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Economic Value */}
        {breed.economicValue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <IndianRupee className="text-amber-500" />
              <span>{t('breed.economic')}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <p className="font-semibold text-amber-700">{breed.economicValue.purchaseCost}</p>
                <p className="text-sm text-gray-600">Purchase Cost</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.economicValue.maintenanceCost}</p>
                <p className="text-sm text-gray-600">Maintenance Cost</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="font-semibold text-gray-900">{breed.economicValue.marketDemand}</p>
                <p className="text-sm text-gray-600">Market Demand</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Conservation Status */}
        {breed.population && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <AlertTriangle className="text-orange-500" />
              <span>{t('breed.conservation')}</span>
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">{breed.population.conservationStatus}</p>
                <p className="text-sm text-gray-600 flex items-center space-x-1">
                  <span>Population trend:</span>
                  <span className="capitalize">{breed.population.status}</span>
                  {getTrendIcon(breed.population.trend)}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Best For */}
        {breed.bestFor && breed.bestFor.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('breed.bestFor')}</h2>
            <div className="flex flex-wrap gap-2">
              {breed.bestFor.map((use, idx) => (
                <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {use}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Government Schemes */}
        {breed.governmentSchemes && breed.governmentSchemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('breed.schemes')}</h2>
            <div className="space-y-2">
              {breed.governmentSchemes.map((scheme, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">{scheme}</span>
                  <Link to="/schemes" className="text-primary-600 hover:text-primary-700">
                    <ExternalLink size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
