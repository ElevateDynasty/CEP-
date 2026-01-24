import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronRight, Leaf } from 'lucide-react';
import breedData from '../data/breedData';

export default function ExplorePage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [breeds, setBreeds] = useState([]);

  useEffect(() => {
    // Combine cattle and buffalo breeds
    const allBreeds = [
      ...Object.entries(breedData.cattle || {}).map(([id, data]) => ({
        id,
        ...data,
        type: 'cattle'
      })),
      ...Object.entries(breedData.buffalo || {}).map(([id, data]) => ({
        id,
        ...data,
        type: 'buffalo'
      }))
    ];
    setBreeds(allBreeds);
  }, []);

  const filteredBreeds = breeds.filter(breed => {
    const matchesSearch = 
      breed.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      breed.nameHindi?.includes(searchQuery) ||
      breed.nativeState?.some(state => state.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || breed.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getConservationBadge = (status) => {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower.includes('critical')) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Critical</span>;
    }
    if (lower.includes('endangered')) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Endangered</span>;
    }
    if (lower.includes('vulnerable')) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Vulnerable</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Stable</span>;
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t('nav.explore')}
          </h1>
          <p className="mt-2 text-gray-600">
            Discover indigenous Indian cattle and buffalo breeds
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, Hindi name, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field w-auto"
              >
                <option value="all">All Types</option>
                <option value="cattle">Cattle Only</option>
                <option value="buffalo">Buffalo Only</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredBreeds.length} breeds
        </p>

        {/* Breeds Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBreeds.map((breed, idx) => (
            <motion.div
              key={breed.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link to={`/breed/${breed.id}`} className="block card-hover">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{breed.name}</h3>
                        {breed.nameHindi && (
                          <p className="text-gray-500 font-hindi">{breed.nameHindi}</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Native State</span>
                      <span className="text-gray-700 font-medium">
                        {breed.nativeState?.slice(0, 2).join(', ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Milk Yield</span>
                      <span className="text-gray-700 font-medium">
                        {breed.productivity?.milkYieldPerDay || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Carbon Score</span>
                      <span className="flex items-center space-x-1 text-green-600 font-medium">
                        <Leaf size={14} />
                        <span>{breed.sustainability?.carbonScore || 'N/A'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Conservation Status */}
                  <div className="flex items-center justify-between">
                    {getConservationBadge(breed.population?.conservationStatus)}
                    <span className="text-xs text-gray-400 capitalize">{breed.type}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredBreeds.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No breeds found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
