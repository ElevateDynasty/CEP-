import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, Plus, X, ChevronDown, Droplets, Leaf, TrendingUp,
  IndianRupee, Download, Share2, Trophy, AlertTriangle, 
  Zap, ThermometerSun, Shield, Clock, Baby, RefreshCw,
  Sparkles, ExternalLink, Check, Crown
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import html2canvas from 'html2canvas';
import { useCompare } from '../context/CompareContext';
import { compareMultipleBreeds, getSustainabilityRanking } from '../services/api';
import breedData, { getAllBreeds } from '../data/breedData';

const COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626'];

// Real Indian cattle and buffalo breed images from Wikimedia Commons
const BREED_IMAGES = {
  cattle: {
    gir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gir_01.JPG/200px-Gir_01.JPG',
    sahiwal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sahiwal_cattle_in_Pakistan.jpg/200px-Sahiwal_cattle_in_Pakistan.jpg',
    redSindhi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sindhi_cow.JPG/200px-Sindhi_cow.JPG',
    tharparkar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Tharparkar_Cattle_%28JLPS%29.jpg/200px-Tharparkar_Cattle_%28JLPS%29.jpg',
    kankrej: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kankrej_Cow_Gujarat.jpg/200px-Kankrej_Cow_Gujarat.jpg',
    ongole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Ongole_bull.JPG/200px-Ongole_bull.JPG',
    hariana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Hariana_bull.jpg/200px-Hariana_bull.jpg',
    rathi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Rathi_cow_of_Bikaner_side_view.jpg/200px-Rathi_cow_of_Bikaner_side_view.jpg',
    deoni: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Deoni_Cattle_breed.jpg/200px-Deoni_Cattle_breed.jpg',
    khillari: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Killari_bull.jpg/200px-Killari_bull.jpg',
    kangayam: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Kangayam_bull_head.jpg/200px-Kangayam_bull_head.jpg',
    hallikar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Hallikar_cattle.jpg/200px-Hallikar_cattle.jpg',
    amritmahal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Amrit_mahal_cattle_breed.jpg/200px-Amrit_mahal_cattle_breed.jpg',
    punganur: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Punganur_cattle.jpg/200px-Punganur_cattle.jpg',
    vechur: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Vechur_Cow.jpg/200px-Vechur_Cow.jpg',
  },
  buffalo: {
    murrah: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Murrah_buffalo_in_PCC.jpg/200px-Murrah_buffalo_in_PCC.jpg',
    mehsana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Mehsana_buffalo.jpg/200px-Mehsana_buffalo.jpg',
    jaffarabadi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Jafarabadi_buffalo.jpg/200px-Jafarabadi_buffalo.jpg',
    surti: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Surti_buffalo.jpg/200px-Surti_buffalo.jpg',
    bhadawari: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Bhadawari_buffalo.jpg/200px-Bhadawari_buffalo.jpg',
    niliRavi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Nili-Ravi_Buffalo.jpg/200px-Nili-Ravi_Buffalo.jpg',
    nagpuri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Nagpuri_buffalo.jpg/200px-Nagpuri_buffalo.jpg',
    pandharpuri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Pandharpuri_Buffalo.jpg/200px-Pandharpuri_Buffalo.jpg',
    toda: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Toda_buffalo.jpg/200px-Toda_buffalo.jpg',
  }
};

// Get breed image with fallback
const getBreedImage = (breed) => {
  if (!breed) return null;
  return BREED_IMAGES[breed.type]?.[breed.id] || null;
};

const getBreedGradient = (breed) => {
  const cattleGradients = [
    'from-amber-500 to-orange-600',
    'from-orange-500 to-red-600',
    'from-yellow-500 to-amber-600',
    'from-red-500 to-rose-600',
  ];
  const buffaloGradients = [
    'from-slate-700 to-gray-900',
    'from-gray-700 to-slate-900',
    'from-zinc-700 to-neutral-900',
    'from-neutral-700 to-stone-900',
  ];
  const gradients = breed?.type === 'cattle' ? cattleGradients : buffaloGradients;
  const hash = (breed?.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `bg-gradient-to-br ${gradients[hash % gradients.length]}`;
};

// Preset comparisons
const COMPARISON_PRESETS = [
  { id: 'dairy', name: 'Best for Dairy', breeds: ['gir', 'sahiwal', 'murrah', 'mehsana'], icon: Droplets },
  { id: 'sustainable', name: 'Most Sustainable', breeds: ['vechur', 'punganur', 'gir', 'sahiwal'], icon: Leaf },
  { id: 'budget', name: 'Budget Friendly', breeds: ['redSindhi', 'hariana', 'nagpuri', 'bhadawari'], icon: IndianRupee },
  { id: 'heat', name: 'Heat Tolerant', breeds: ['tharparkar', 'kankrej', 'ongole', 'kangayam'], icon: ThermometerSun },
];

export default function ComparePage() {
  const { t } = useTranslation();
  const { selectedBreeds, addBreed, removeBreed, clearAll } = useCompare();
  const [showSelector, setShowSelector] = useState(false);
  const [backendData, setBackendData] = useState(null);
  const [sustainabilityRanking, setSustainabilityRanking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const comparisonRef = useRef(null);

  const allBreeds = useMemo(() => getAllBreeds(), []);

  // Fetch backend comparison data
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedBreeds.length >= 2) {
        setLoading(true);
        try {
          const data = await compareMultipleBreeds(selectedBreeds);
          setBackendData(data);
        } catch (error) {
          console.error('Failed to fetch comparison:', error);
          setBackendData(null);
        }
        setLoading(false);
      } else {
        setBackendData(null);
      }
    };
    fetchComparison();
  }, [selectedBreeds]);

  // Fetch sustainability ranking
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await getSustainabilityRanking(null, 10);
        setSustainabilityRanking(data.ranking || []);
      } catch (error) {
        console.error('Failed to fetch ranking:', error);
      }
    };
    fetchRanking();
  }, []);

  const getBreedData = (id) => {
    return breedData.cattle[id] || breedData.buffalo[id];
  };

  // Helper to extract numeric values
  const extractNumeric = (str, type = 'range') => {
    if (!str || typeof str !== 'string') return 0;
    const matches = str.match(/[\d.]+/g);
    if (!matches) return 0;
    if (type === 'range' && matches.length >= 2) {
      return (parseFloat(matches[0]) + parseFloat(matches[1])) / 2;
    }
    return parseFloat(matches[0]) || 0;
  };

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    if (selectedBreeds.length === 0) return [];

    const metrics = [
      { key: 'carbonScore', label: 'Carbon Score' },
      { key: 'heatTolerance', label: 'Heat Tolerance' },
      { key: 'diseaseResistance', label: 'Disease Resistance' },
      { key: 'feedEfficiency', label: 'Feed Efficiency' }
    ];

    const toleranceToScore = {
      'Exceptional': 100, 'Excellent': 90, 'Very High': 85, 'Very Good': 80,
      'High': 75, 'Good': 65, 'Medium': 50, 'Low': 30
    };

    return metrics.map(metric => {
      const point = { metric: metric.label };
      selectedBreeds.forEach(breedId => {
        const breed = getBreedData(breedId);
        if (breed?.sustainability) {
          if (metric.key === 'carbonScore') {
            point[breed.name] = breed.sustainability.carbonScore || 0;
          } else {
            const value = breed.sustainability[metric.key] || 'Medium';
            point[breed.name] = toleranceToScore[value] || 50;
          }
        }
      });
      return point;
    });
  }, [selectedBreeds]);

  // Prepare milk data
  const milkData = useMemo(() => {
    return selectedBreeds.map(breedId => {
      const breed = getBreedData(breedId);
      if (!breed) return null;
      
      return {
        name: breed.name,
        milkYield: extractNumeric(breed.productivity?.milkYieldPerDay, 'range'),
        fatContent: extractNumeric(breed.productivity?.fatContent, 'range')
      };
    }).filter(Boolean);
  }, [selectedBreeds]);

  // Find best values for highlighting winners
  const findBestValues = useMemo(() => {
    const breeds = selectedBreeds.map(id => getBreedData(id)).filter(Boolean);
    if (breeds.length === 0) return {};

    return {
      milkYield: Math.max(...breeds.map(b => extractNumeric(b.productivity?.milkYieldPerDay))),
      carbonScore: Math.max(...breeds.map(b => b.sustainability?.carbonScore || 0)),
      fatContent: Math.max(...breeds.map(b => extractNumeric(b.productivity?.fatContent))),
      lowestPrice: Math.min(...breeds.map(b => extractNumeric(b.economicValue?.purchaseCost)))
    };
  }, [selectedBreeds]);

  // Check if a value is the winner
  const isWinner = (breedId, metric) => {
    const breed = getBreedData(breedId);
    if (!breed) return false;

    switch (metric) {
      case 'milkYield':
        return extractNumeric(breed.productivity?.milkYieldPerDay) === findBestValues.milkYield;
      case 'carbonScore':
        return (breed.sustainability?.carbonScore || 0) === findBestValues.carbonScore;
      case 'fatContent':
        return extractNumeric(breed.productivity?.fatContent) === findBestValues.fatContent;
      case 'price':
        return extractNumeric(breed.economicValue?.purchaseCost) === findBestValues.lowestPrice;
      default:
        return false;
    }
  };

  // Export as image
  const exportAsImage = async () => {
    if (!comparisonRef.current) return;
    try {
      const canvas = await html2canvas(comparisonRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      const link = document.createElement('a');
      link.download = `breed-comparison-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Share comparison
  const shareComparison = async () => {
    const breedNames = selectedBreeds.map(id => getBreedData(id)?.name).filter(Boolean);
    const shareData = {
      title: 'Breed Comparison',
      text: `Comparing ${breedNames.join(', ')} - Indian Cattle & Buffalo Breed Recognition`,
      url: window.location.href
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      alert('Link copied to clipboard!');
    }
  };

  // Apply preset
  const applyPreset = (preset) => {
    clearAll();
    setTimeout(() => {
      preset.breeds.forEach(breedId => addBreed(breedId));
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t('compare.title', 'Compare Breeds')}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            {t('compare.subtitle', 'Compare up to 4 breeds side by side to find the perfect match for your needs.')}
          </p>
        </motion.div>

        {/* Quick Presets */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <p className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            Quick Comparisons
          </p>
          <div className="flex flex-wrap gap-3">
            {COMPARISON_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all shadow-sm"
              >
                <preset.icon size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">{preset.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Breed Selector Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {selectedBreeds.map((breedId, index) => {
            const breed = getBreedData(breedId);
            if (!breed) return null;
            const isTopSustainable = sustainabilityRanking[0]?.id === breedId;
            
            return (
              <motion.div
                key={breedId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
                style={{ borderTop: `4px solid ${COLORS[index]}` }}
              >
                <button
                  onClick={() => removeBreed(breedId)}
                  className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full transition-colors z-10"
                >
                  <X size={14} />
                </button>
                
                {isTopSustainable && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown size={10} />
                    Top Eco
                  </div>
                )}

                <div className="p-4">
                  <div className={`w-16 h-16 rounded-xl overflow-hidden mx-auto mb-3 ${getBreedGradient(breed)}`}>
                    {getBreedImage(breed) ? (
                      <img
                        src={getBreedImage(breed)}
                        alt={breed.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-900 mt-1">{breed.name}</h3>
                    <p className="text-xs text-gray-500">{breed.nativeState?.[0]}</p>
                    <Link
                      to={`/breed/${breedId}`}
                      className="text-xs text-green-600 hover:text-green-700 mt-2 inline-flex items-center gap-1"
                    >
                      View details <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {selectedBreeds.length < 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="w-full h-full min-h-[180px] border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-colors bg-white/50"
              >
                <Plus size={32} />
                <span className="text-sm mt-2 font-medium">{t('compare.addBreed', 'Add Breed')}</span>
                <span className="text-xs mt-1">{selectedBreeds.length}/4 selected</span>
              </button>

              <AnimatePresence>
                {showSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto"
                  >
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                      <input
                        type="text"
                        placeholder="Search breeds..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    {allBreeds
                      .filter(b => !selectedBreeds.includes(b.id))
                      .map(breed => (
                        <button
                          key={breed.id}
                          onClick={() => { addBreed(breed.id); setShowSelector(false); }}
                          className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center gap-3 transition-colors"
                        >
                          <span className="text-xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                          <div>
                            <span className="font-medium text-gray-900">{breed.name}</span>
                            <span className="text-xs text-gray-400 ml-2">{breed.nativeState?.[0]}</span>
                          </div>
                          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            {breed.sustainability?.carbonScore}/100
                          </span>
                        </button>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        {selectedBreeds.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <RefreshCw size={16} />
                Clear All
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={shareComparison}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
              <button
                onClick={exportAsImage}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </motion.div>
        )}

        {/* Backend Insights */}
        {backendData?.insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6" />
              <h3 className="text-lg font-bold">AI Recommendation</h3>
            </div>
            <p className="text-green-100">
              Based on sustainability analysis, <span className="font-bold text-white">{backendData.insights.best_sustainability}</span> has the highest eco-score among your selected breeds.
            </p>
          </motion.div>
        )}

        {selectedBreeds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <Scale size={80} className="mx-auto mb-6 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">{t('compare.selectBreeds', 'Select breeds to compare')}</h3>
            <p className="text-gray-500 mb-6">Add up to 4 breeds to see detailed comparisons</p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Browse Breeds
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </Link>
          </motion.div>
        ) : (
          <div ref={comparisonRef} className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-md">
              {[
                { id: 'overview', label: 'Overview', icon: Scale },
                { id: 'sustainability', label: 'Sustainability', icon: Leaf },
                { id: 'productivity', label: 'Productivity', icon: Droplets },
                { id: 'details', label: 'All Details', icon: TrendingUp }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Trophy className="text-amber-500" />
                    Winners
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBreeds.map(breedId => {
                      const breed = getBreedData(breedId);
                      if (!breed) return null;
                      const wins = ['milkYield', 'carbonScore', 'fatContent', 'price'].filter(m => isWinner(breedId, m));
                      
                      return (
                        <div key={breedId} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                            <span className="font-bold text-gray-900">{breed.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {isWinner(breedId, 'milkYield') && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Droplets size={10} /> Best Milk
                              </span>
                            )}
                            {isWinner(breedId, 'carbonScore') && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Leaf size={10} /> Most Eco
                              </span>
                            )}
                            {isWinner(breedId, 'fatContent') && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <TrendingUp size={10} /> Richest
                              </span>
                            )}
                            {isWinner(breedId, 'price') && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <IndianRupee size={10} /> Best Value
                              </span>
                            )}
                            {wins.length === 0 && (
                              <span className="text-xs text-gray-400">No category wins</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Milk Production */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Droplets className="text-blue-500" />
                    Milk Production
                  </h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={milkData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" orientation="left" stroke="#0284c7" />
                        <YAxis yAxisId="right" orientation="right" stroke="#d97706" />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="milkYield" name="Milk (L/day)" radius={[4, 4, 0, 0]}>
                          {milkData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                        <Bar yAxisId="right" dataKey="fatContent" name="Fat (%)" fill="#d97706" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Sustainability Tab */}
            {(activeTab === 'sustainability' || activeTab === 'overview') && selectedBreeds.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Leaf className="text-green-500" />
                  Sustainability Metrics
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      {selectedBreeds.map((breedId, index) => {
                        const breed = getBreedData(breedId);
                        return (
                          <Radar
                            key={breedId}
                            name={breed?.name}
                            dataKey={breed?.name}
                            stroke={COLORS[index]}
                            fill={COLORS[index]}
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        );
                      })}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Productivity Tab */}
            {activeTab === 'productivity' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Droplets />
                    Productivity Comparison
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Metric</th>
                        {selectedBreeds.map((breedId, index) => {
                          const breed = getBreedData(breedId);
                          return (
                            <th key={breedId} className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS[index] }}>
                              {breed?.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[
                        { key: 'milkYieldPerDay', label: 'Daily Milk Yield', icon: Droplets, winner: 'milkYield' },
                        { key: 'lactationYield', label: 'Lactation Yield', icon: TrendingUp },
                        { key: 'fatContent', label: 'Fat Content', icon: Zap, winner: 'fatContent' },
                        { key: 'lactationPeriod', label: 'Lactation Period', icon: Clock },
                        { key: 'ageAtFirstCalving', label: 'Age at First Calving', icon: Baby },
                        { key: 'calvingInterval', label: 'Calving Interval', icon: RefreshCw }
                      ].map((row, idx) => (
                        <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                            <row.icon size={14} className="text-gray-400" />
                            {row.label}
                          </td>
                          {selectedBreeds.map(breedId => {
                            const breed = getBreedData(breedId);
                            const value = breed?.productivity?.[row.key] || 'N/A';
                            const isWin = row.winner && isWinner(breedId, row.winner);
                            return (
                              <td key={breedId} className={`px-4 py-3 text-sm font-medium ${isWin ? 'text-green-600 bg-green-50' : ''}`}>
                                {isWin && <Crown size={12} className="inline mr-1 text-amber-500" />}
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Details Tab - Full Comparison Table */}
            {activeTab === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-4">
                  <h2 className="text-xl font-bold">Detailed Comparison</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 w-40">Attribute</th>
                        {selectedBreeds.map((breedId, index) => {
                          const breed = getBreedData(breedId);
                          return (
                            <th key={breedId} className="px-4 py-3 text-left text-sm font-medium" style={{ color: COLORS[index] }}>
                              {breed?.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {/* Basic Info */}
                      <tr className="bg-gray-100">
                        <td colSpan={selectedBreeds.length + 1} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Basic Info</td>
                      </tr>
                      {[
                        { key: 'type', label: 'Type', getValue: (b) => b?.type },
                        { key: 'nativeState', label: 'Native States', getValue: (b) => b?.nativeState?.join(', ') },
                        { key: 'nativeRegion', label: 'Native Region', getValue: (b) => b?.nativeRegion }
                      ].map((row, idx) => (
                        <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.label}</td>
                          {selectedBreeds.map(breedId => {
                            const breed = getBreedData(breedId);
                            return <td key={breedId} className="px-4 py-3 text-sm capitalize">{row.getValue(breed) || 'N/A'}</td>;
                          })}
                        </tr>
                      ))}

                      {/* Characteristics */}
                      <tr className="bg-gray-100">
                        <td colSpan={selectedBreeds.length + 1} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Physical Characteristics</td>
                      </tr>
                      {[
                        { key: 'bodyColor', label: 'Body Color' },
                        { key: 'hornShape', label: 'Horn Shape' },
                        { key: 'bodySize', label: 'Body Size' },
                        { key: 'humpSize', label: 'Hump Size' }
                      ].map((row, idx) => (
                        <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.label}</td>
                          {selectedBreeds.map(breedId => {
                            const breed = getBreedData(breedId);
                            return <td key={breedId} className="px-4 py-3 text-sm">{breed?.characteristics?.[row.key] || 'N/A'}</td>;
                          })}
                        </tr>
                      ))}

                      {/* Sustainability */}
                      <tr className="bg-gray-100">
                        <td colSpan={selectedBreeds.length + 1} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Sustainability</td>
                      </tr>
                      {[
                        { key: 'carbonScore', label: 'Carbon Score', highlight: true },
                        { key: 'heatTolerance', label: 'Heat Tolerance' },
                        { key: 'diseaseResistance', label: 'Disease Resistance' },
                        { key: 'feedEfficiency', label: 'Feed Efficiency' },
                        { key: 'climateAdaptability', label: 'Climate Adaptability' }
                      ].map((row, idx) => (
                        <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.label}</td>
                          {selectedBreeds.map(breedId => {
                            const breed = getBreedData(breedId);
                            const value = breed?.sustainability?.[row.key];
                            const isWin = row.key === 'carbonScore' && isWinner(breedId, 'carbonScore');
                            return (
                              <td key={breedId} className={`px-4 py-3 text-sm ${isWin ? 'text-green-600 font-bold bg-green-50' : ''} ${row.highlight ? 'font-medium' : ''}`}>
                                {isWin && <Crown size={12} className="inline mr-1 text-amber-500" />}
                                {row.key === 'carbonScore' ? `${value}/100` : value || 'N/A'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Economic */}
                      <tr className="bg-gray-100">
                        <td colSpan={selectedBreeds.length + 1} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Economic Value</td>
                      </tr>
                      {[
                        { key: 'purchaseCost', label: 'Purchase Cost', winner: 'price' },
                        { key: 'maintenanceCost', label: 'Maintenance Cost' },
                        { key: 'marketDemand', label: 'Market Demand' }
                      ].map((row, idx) => (
                        <tr key={row.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-4 py-3 text-sm text-gray-600">{row.label}</td>
                          {selectedBreeds.map(breedId => {
                            const breed = getBreedData(breedId);
                            const isWin = row.winner && isWinner(breedId, row.winner);
                            return (
                              <td key={breedId} className={`px-4 py-3 text-sm ${isWin ? 'text-green-600 font-bold bg-green-50' : ''}`}>
                                {isWin && <Crown size={12} className="inline mr-1 text-amber-500" />}
                                {breed?.economicValue?.[row.key] || 'N/A'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* Conservation */}
                      <tr className="bg-gray-100">
                        <td colSpan={selectedBreeds.length + 1} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Conservation</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600">Conservation Status</td>
                        {selectedBreeds.map(breedId => {
                          const breed = getBreedData(breedId);
                          const status = breed?.population?.conservationStatus;
                          const isAtRisk = status?.toLowerCase().includes('endangered') || status?.toLowerCase().includes('vulnerable');
                          return (
                            <td key={breedId} className={`px-4 py-3 text-sm ${isAtRisk ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                              {isAtRisk && <AlertTriangle size={12} className="inline mr-1" />}
                              {status || 'N/A'}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Best For */}
                      <tr className="bg-gray-100">
                        <td colSpan={selectedBreeds.length + 1} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Best For</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600">Use Cases</td>
                        {selectedBreeds.map(breedId => {
                          const breed = getBreedData(breedId);
                          return (
                            <td key={breedId} className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-1">
                                {breed?.bestFor?.map((use, i) => (
                                  <span key={i} className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                    {use}
                                  </span>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Sustainability Ranking */}
        {sustainabilityRanking.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="text-amber-500" />
              Top 5 Sustainable Breeds
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {sustainabilityRanking.slice(0, 5).map((breed, index) => (
                <div
                  key={breed.id}
                  className={`p-4 rounded-xl text-center ${
                    index === 0 ? 'bg-gradient-to-br from-amber-100 to-amber-50 border-2 border-amber-300' :
                    index === 1 ? 'bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-gray-300' :
                    index === 2 ? 'bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300' :
                    'bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <p className="font-bold text-gray-900">{breed.name}</p>
                  <p className="text-sm text-green-600 font-medium">{breed.carbon_score}/100</p>
                  <p className="text-xs text-gray-400 capitalize">{breed.type}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
