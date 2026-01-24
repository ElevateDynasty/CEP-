import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Scale, 
  Plus, 
  X, 
  ChevronDown,
  Droplets,
  Leaf,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import breedData, { getAllBreeds } from '../data/breedData';

const COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626'];

export default function ComparePage() {
  const { t } = useTranslation();
  const [selectedBreeds, setSelectedBreeds] = useState([]);
  const [showSelector, setShowSelector] = useState(false);

  const allBreeds = useMemo(() => getAllBreeds(), []);

  const addBreed = (breedId) => {
    if (selectedBreeds.length < 4 && !selectedBreeds.includes(breedId)) {
      setSelectedBreeds([...selectedBreeds, breedId]);
    }
    setShowSelector(false);
  };

  const removeBreed = (breedId) => {
    setSelectedBreeds(selectedBreeds.filter(id => id !== breedId));
  };

  const getBreedData = (id) => {
    return breedData.cattle[id] || breedData.buffalo[id];
  };

  // Prepare data for radar chart (sustainability metrics)
  const radarData = useMemo(() => {
    if (selectedBreeds.length === 0) return [];

    const metrics = [
      { key: 'carbonScore', label: 'Carbon Score' },
      { key: 'heatTolerance', label: 'Heat Tolerance' },
      { key: 'diseaseResistance', label: 'Disease Resistance' },
      { key: 'feedEfficiency', label: 'Feed Efficiency' }
    ];

    const toleranceToScore = {
      'Exceptional': 100,
      'Excellent': 90,
      'Very High': 85,
      'Very Good': 80,
      'High': 75,
      'Good': 65,
      'Medium': 50,
      'Low': 30
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

  // Prepare data for milk yield comparison
  const milkData = useMemo(() => {
    return selectedBreeds.map(breedId => {
      const breed = getBreedData(breedId);
      if (!breed) return null;
      
      // Extract average milk yield from string like "6-12 liters"
      const yieldStr = breed.productivity?.milkYieldPerDay || '0';
      const matches = yieldStr.match(/(\d+)-?(\d+)?/);
      let avgYield = 0;
      if (matches) {
        const min = parseInt(matches[1]) || 0;
        const max = parseInt(matches[2]) || min;
        avgYield = (min + max) / 2;
      }

      // Extract fat content
      const fatStr = breed.productivity?.fatContent || '0';
      const fatMatches = fatStr.match(/(\d+\.?\d*)-?(\d+\.?\d*)?/);
      let avgFat = 0;
      if (fatMatches) {
        const min = parseFloat(fatMatches[1]) || 0;
        const max = parseFloat(fatMatches[2]) || min;
        avgFat = (min + max) / 2;
      }

      return {
        name: breed.name,
        milkYield: avgYield,
        fatContent: avgFat
      };
    }).filter(Boolean);
  }, [selectedBreeds]);

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
            <Scale className="text-primary-600" />
            <span>{t('compare.title')}</span>
          </h1>
          <p className="text-gray-600 mt-2">{t('compare.subtitle')}</p>
        </motion.div>

        {/* Breed Selector Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {selectedBreeds.map((breedId, index) => {
            const breed = getBreedData(breedId);
            if (!breed) return null;
            return (
              <motion.div
                key={breedId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-4 relative"
                style={{ borderTop: `4px solid ${COLORS[index]}` }}
              >
                <button
                  onClick={() => removeBreed(breedId)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>
                <div className="text-center">
                  <span className="text-3xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                  <h3 className="font-semibold text-gray-900 mt-2">{breed.name}</h3>
                  <p className="text-xs text-gray-500">{breed.nativeState?.[0]}</p>
                </div>
              </motion.div>
            );
          })}

          {selectedBreeds.length < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <button
                onClick={() => setShowSelector(!showSelector)}
                className="w-full h-full min-h-[120px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <Plus size={24} />
                <span className="text-sm mt-1">{t('compare.addBreed')}</span>
              </button>

              {/* Dropdown Selector */}
              {showSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  {allBreeds
                    .filter(b => !selectedBreeds.includes(b.id))
                    .map(breed => (
                      <button
                        key={breed.id}
                        onClick={() => addBreed(breed.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <span>{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                        <span>{breed.name}</span>
                        <span className="text-xs text-gray-400">({breed.nativeState?.[0]})</span>
                      </button>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {selectedBreeds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Scale size={64} className="mx-auto mb-4 opacity-30" />
            <p>{t('compare.selectBreeds')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sustainability Radar Chart */}
            {selectedBreeds.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Leaf className="text-green-500" />
                  <span>{t('compare.sustainability')}</span>
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
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
                          />
                        );
                      })}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Milk Production Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Droplets className="text-blue-500" />
                <span>{t('compare.milkProduction')}</span>
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={milkData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#0284c7" />
                    <YAxis yAxisId="right" orientation="right" stroke="#d97706" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="milkYield" name="Milk (L/day)" fill="#0284c7" />
                    <Bar yAxisId="right" dataKey="fatContent" name="Fat (%)" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Detailed Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card overflow-hidden"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{t('compare.detailedComparison')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Attribute</th>
                      {selectedBreeds.map((breedId, index) => {
                        const breed = getBreedData(breedId);
                        return (
                          <th
                            key={breedId}
                            className="px-4 py-3 text-left text-sm font-medium"
                            style={{ color: COLORS[index] }}
                          >
                            {breed?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">Type</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm font-medium capitalize">
                            {breed?.type}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">Native State</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm">
                            {breed?.nativeState?.join(', ')}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">Daily Milk Yield</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm font-medium text-blue-600">
                            {breed?.productivity?.milkYieldPerDay}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">Fat Content</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm">
                            {breed?.productivity?.fatContent}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">Carbon Score</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm font-medium text-green-600">
                            {breed?.sustainability?.carbonScore}/100
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">Heat Tolerance</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm">
                            {breed?.sustainability?.heatTolerance}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">Disease Resistance</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm">
                            {breed?.sustainability?.diseaseResistance}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">Purchase Cost</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm font-medium text-amber-600">
                            {breed?.economicValue?.purchaseCost}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-600">Conservation Status</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        const status = breed?.population?.conservationStatus;
                        const isEndangered = status?.toLowerCase().includes('endangered') || status?.toLowerCase().includes('vulnerable');
                        return (
                          <td key={breedId} className={`px-4 py-3 text-sm ${isEndangered ? 'text-red-600 font-medium' : ''}`}>
                            {status}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">Best For</td>
                      {selectedBreeds.map(breedId => {
                        const breed = getBreedData(breedId);
                        return (
                          <td key={breedId} className="px-4 py-3 text-sm">
                            {breed?.bestFor?.slice(0, 2).join(', ')}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
