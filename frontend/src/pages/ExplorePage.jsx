import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronRight, Leaf, ChevronDown, ChevronUp,
  Grid3X3, List, SortAsc, MapPin, Scale, Check,
  X, AlertTriangle, Droplets, IndianRupee
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import breedData from '../data/breedData';

// Real Indian cattle and buffalo breed images from Wikimedia Commons (verified working URLs)
// Load all breed images from local assets
const breedImages = import.meta.glob('../assets/breeds/*.jpg', { eager: true });

// Get breed image - returns local asset or null
const getBreedImage = (breed) => {
  const path = `../assets/breeds/${breed.id}.jpg`;
  return breedImages[path]?.default || null;
};

// Generate a unique gradient based on breed for visual distinction
const getBreedGradient = (breed) => {
  // Cattle get warm earthy tones, buffalo get cool dark tones
  const cattleGradients = [
    'from-amber-500 to-orange-600',
    'from-orange-500 to-red-600',
    'from-yellow-500 to-amber-600',
    'from-red-500 to-rose-600',
    'from-amber-600 to-yellow-500',
    'from-orange-600 to-amber-500',
    'from-rose-500 to-red-600',
    'from-yellow-600 to-orange-500',
  ];

  const buffaloGradients = [
    'from-slate-700 to-gray-900',
    'from-gray-700 to-slate-900',
    'from-zinc-700 to-neutral-900',
    'from-neutral-700 to-stone-900',
    'from-stone-700 to-zinc-900',
    'from-slate-800 to-gray-950',
  ];

  const gradients = breed.type === 'cattle' ? cattleGradients : buffaloGradients;
  const hash = breed.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `bg-gradient-to-br ${gradients[hash % gradients.length]}`;
};

// Get breed initials for display
const getBreedInitials = (breed) => {
  return breed.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
};

// Sort options
const SORT_OPTIONS = [
  { id: 'name-asc', label: 'Name (A-Z)', field: 'name', direction: 'asc' },
  { id: 'name-desc', label: 'Name (Z-A)', field: 'name', direction: 'desc' },
  { id: 'milk-high', label: 'Milk Yield (High)', field: 'milkYield', direction: 'desc' },
  { id: 'milk-low', label: 'Milk Yield (Low)', field: 'milkYield', direction: 'asc' },
  { id: 'carbon-high', label: 'Carbon Score (Best)', field: 'carbonScore', direction: 'desc' },
  { id: 'carbon-low', label: 'Carbon Score (Low)', field: 'carbonScore', direction: 'asc' },
  { id: 'price-high', label: 'Price (High)', field: 'price', direction: 'desc' },
  { id: 'price-low', label: 'Price (Low)', field: 'price', direction: 'asc' },
];

// Conservation status options
const CONSERVATION_OPTIONS = [
  { id: 'all', label: 'All Status' },
  { id: 'critical', label: 'Critical' },
  { id: 'endangered', label: 'Endangered' },
  { id: 'vulnerable', label: 'Vulnerable' },
  { id: 'stable', label: 'Stable / Not at Risk' },
];

// Get all unique states from breed data
const getAllStates = () => {
  const states = new Set();
  Object.values(breedData.cattle || {}).forEach(breed => {
    breed.nativeState?.forEach(state => states.add(state));
  });
  Object.values(breedData.buffalo || {}).forEach(breed => {
    breed.nativeState?.forEach(state => states.add(state));
  });
  return Array.from(states).sort();
};

export default function ExplorePage() {
  const { t } = useTranslation();
  const { selectedBreeds, toggleBreed, isSelected, canAddMore } = useCompare();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterConservation, setFilterConservation] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [breeds, setBreeds] = useState([]);

  // Get all states for filter
  const allStates = useMemo(() => getAllStates(), []);

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

  // Extract numeric values for sorting
  const extractMilkYield = (breed) => {
    const yieldStr = breed.productivity?.milkYieldPerDay || '0';
    const matches = yieldStr.match(/(\d+)-?(\d+)?/);
    if (matches) {
      const min = parseInt(matches[1]) || 0;
      const max = parseInt(matches[2]) || min;
      return (min + max) / 2;
    }
    return 0;
  };

  const extractPrice = (breed) => {
    const priceStr = breed.economicValue?.purchaseCost || '0';
    const matches = priceStr.match(/[\d,]+/g);
    if (matches && matches.length >= 2) {
      const min = parseInt(matches[0].replace(/,/g, '')) || 0;
      const max = parseInt(matches[1].replace(/,/g, '')) || min;
      return (min + max) / 2;
    }
    return 0;
  };

  // Filter and sort breeds
  const filteredBreeds = useMemo(() => {
    let result = breeds.filter(breed => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        breed.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.nameHindi?.includes(searchQuery) ||
        breed.nativeState?.some(state => state.toLowerCase().includes(searchQuery.toLowerCase())) ||
        breed.bestFor?.some(use => use.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type filter
      const matchesType = filterType === 'all' || breed.type === filterType;

      // State filter
      const matchesState = filterState === 'all' || breed.nativeState?.includes(filterState);

      // Conservation filter
      const status = breed.population?.conservationStatus?.toLowerCase() || '';
      let matchesConservation = true;
      if (filterConservation !== 'all') {
        if (filterConservation === 'critical') {
          matchesConservation = status.includes('critical');
        } else if (filterConservation === 'endangered') {
          matchesConservation = status.includes('endangered');
        } else if (filterConservation === 'vulnerable') {
          matchesConservation = status.includes('vulnerable');
        } else if (filterConservation === 'stable') {
          matchesConservation = status.includes('not at risk') || status.includes('stable');
        }
      }

      return matchesSearch && matchesType && matchesState && matchesConservation;
    });

    // Sort
    const sortOption = SORT_OPTIONS.find(opt => opt.id === sortBy);
    if (sortOption) {
      result.sort((a, b) => {
        let valueA, valueB;

        switch (sortOption.field) {
          case 'name':
            valueA = a.name || '';
            valueB = b.name || '';
            break;
          case 'milkYield':
            valueA = extractMilkYield(a);
            valueB = extractMilkYield(b);
            break;
          case 'carbonScore':
            valueA = a.sustainability?.carbonScore || 0;
            valueB = b.sustainability?.carbonScore || 0;
            break;
          case 'price':
            valueA = extractPrice(a);
            valueB = extractPrice(b);
            break;
          default:
            return 0;
        }

        if (typeof valueA === 'string') {
          return sortOption.direction === 'asc'
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        return sortOption.direction === 'asc' ? valueA - valueB : valueB - valueA;
      });
    }

    return result;
  }, [breeds, searchQuery, filterType, filterState, filterConservation, sortBy]);

  const getConservationBadge = (status) => {
    if (!status) return null;
    const lower = status.toLowerCase();
    if (lower.includes('critical')) {
      return { text: 'Critical', className: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (lower.includes('endangered')) {
      return { text: 'Endangered', className: 'bg-orange-100 text-orange-700 border-orange-200' };
    }
    if (lower.includes('vulnerable')) {
      return { text: 'Vulnerable', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    }
    return { text: 'Stable', className: 'bg-green-100 text-green-700 border-green-200' };
  };

  const handleCompareToggle = (e, breedId) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBreed(breedId);
  };

  const activeFilterCount = [
    filterType !== 'all',
    filterState !== 'all',
    filterConservation !== 'all'
  ].filter(Boolean).length;

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
            <Search className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t('nav.explore', 'Explore Breeds')}
          </h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
            Discover {breeds.length} indigenous Indian cattle and buffalo breeds with detailed information on productivity, sustainability, and economic value.
          </p>
        </motion.div>

        {/* Search and Quick Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, Hindi name, state, or usage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Type Quick Filter */}
            <div className="flex items-center gap-2">
              {['all', 'cattle', 'buffalo'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filterType === type
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {type === 'all' ? 'All' : type === 'cattle' ? '🐄 Cattle' : '🐃 Buffalo'}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
                title="Grid View"
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400'}`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${showFilters || activeFilterCount > 0
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Filter size={18} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-100">
                  {/* State Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={14} className="inline mr-1" />
                      Native State
                    </label>
                    <select
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="all">All States</option>
                      {allStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {/* Conservation Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <AlertTriangle size={14} className="inline mr-1" />
                      Conservation Status
                    </label>
                    <select
                      value={filterConservation}
                      onChange={(e) => setFilterConservation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {CONSERVATION_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <SortAsc size={14} className="inline mr-1" />
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterState('all');
                        setFilterConservation('all');
                        setSortBy('name-asc');
                      }}
                      className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                    >
                      <X size={14} />
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count and Compare Info */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredBreeds.length}</span> of {breeds.length} breeds
          </p>
          {selectedBreeds.length > 0 && (
            <p className="text-sm text-green-600 font-medium">
              <Scale size={14} className="inline mr-1" />
              {selectedBreeds.length} breed{selectedBreeds.length > 1 ? 's' : ''} selected for comparison
            </p>
          )}
        </div>

        {/* Breeds Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBreeds.map((breed, idx) => {
              const badge = getConservationBadge(breed.population?.conservationStatus);
              const selected = isSelected(breed.id);
              const imageUrl = getBreedImage(breed);
              const gradientClass = getBreedGradient(breed);

              return (
                <motion.div
                  key={breed.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group"
                >
                  <Link
                    to={`/breed/${breed.id}`}
                    className={`block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border-2 ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent'
                      }`}
                  >
                    {/* Image with gradient fallback */}
                    <div className={`relative h-40 overflow-hidden ${gradientClass}`}>
                      {/* Real breed image */}
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={breed.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      {/* Fallback emoji if no image */}
                      {!imageUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-8xl opacity-90 drop-shadow-lg">
                            {breed.type === 'cattle' ? '🐄' : '🐃'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                      {/* Breed type label */}
                      <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full font-medium">
                        {breed.type === 'cattle' ? 'Cattle' : 'Buffalo'}
                      </span>

                      {/* Compare Button */}
                      <button
                        onClick={(e) => handleCompareToggle(e, breed.id)}
                        disabled={!selected && !canAddMore}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all ${selected
                            ? 'bg-green-500 text-white'
                            : canAddMore
                              ? 'bg-white/90 text-gray-600 hover:bg-green-500 hover:text-white'
                              : 'bg-white/50 text-gray-400 cursor-not-allowed'
                          }`}
                        title={selected ? 'Remove from compare' : canAddMore ? 'Add to compare' : 'Max 4 breeds'}
                      >
                        {selected ? <Check size={16} /> : <Scale size={16} />}
                      </button>

                      {/* Name on Image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="font-bold text-xl text-white drop-shadow-lg">{breed.name}</h3>
                        {breed.nameHindi && (
                          <p className="text-white/90 text-sm font-hindi drop-shadow">{breed.nameHindi}</p>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* States */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {breed.nativeState?.map((state, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {state}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Droplets size={14} className="text-blue-500" />
                          <span className="text-gray-600">{breed.productivity?.milkYieldPerDay || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Leaf size={14} className="text-green-500" />
                          <span className="text-gray-600">{breed.sustainability?.carbonScore || 'N/A'}/100</span>
                        </div>
                      </div>

                      {/* Best For Tags */}
                      {breed.bestFor && breed.bestFor.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {breed.bestFor.slice(0, 2).map((use, i) => (
                            <span
                              key={i}
                              className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                            >
                              {use}
                            </span>
                          ))}
                          {breed.bestFor.length > 2 && (
                            <span className="text-xs text-gray-400">+{breed.bestFor.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        {badge && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badge.className}`}>
                            {badge.text}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          View details <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredBreeds.map((breed, idx) => {
              const badge = getConservationBadge(breed.population?.conservationStatus);
              const selected = isSelected(breed.id);
              const imageUrl = getBreedImage(breed);
              const gradientClass = getBreedGradient(breed);

              return (
                <motion.div
                  key={breed.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <Link
                    to={`/breed/${breed.id}`}
                    className={`flex items-center gap-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 border-2 ${selected ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent'
                      }`}
                  >
                    {/* Image with gradient fallback */}
                    <div className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 ${gradientClass}`}>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={breed.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full items-center justify-center ${imageUrl ? 'hidden' : 'flex'}`}>
                        <span className="text-4xl drop-shadow-lg">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-bold text-gray-900">{breed.name}</h3>
                          {breed.nameHindi && (
                            <p className="text-sm text-gray-500 font-hindi">{breed.nameHindi}</p>
                          )}
                        </div>
                        {badge && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border flex-shrink-0 ${badge.className}`}>
                            {badge.text}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-gray-400" />
                          {breed.nativeState?.slice(0, 2).join(', ')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Droplets size={14} className="text-blue-500" />
                          {breed.productivity?.milkYieldPerDay || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Leaf size={14} className="text-green-500" />
                          {breed.sustainability?.carbonScore || 'N/A'}/100
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee size={14} className="text-amber-500" />
                          {breed.economicValue?.purchaseCost?.split('-')[0] || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleCompareToggle(e, breed.id)}
                        disabled={!selected && !canAddMore}
                        className={`p-2 rounded-lg transition-all ${selected
                            ? 'bg-green-500 text-white'
                            : canAddMore
                              ? 'bg-gray-100 text-gray-600 hover:bg-green-500 hover:text-white'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        title={selected ? 'Remove from compare' : canAddMore ? 'Add to compare' : 'Max 4 breeds'}
                      >
                        {selected ? <Check size={18} /> : <Scale size={18} />}
                      </button>
                      <ChevronRight className="text-gray-300" size={20} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No results */}
        {filteredBreeds.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No breeds found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
                setFilterState('all');
                setFilterConservation('all');
              }}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
