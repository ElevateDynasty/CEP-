import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, X, ExternalLink, Filter, Search, ChevronDown, ChevronUp,
  AlertTriangle, TrendingUp, ZoomIn, ZoomOut, RotateCcw,
  Info, Globe, BarChart3, Shield, Leaf
} from 'lucide-react';
import breedData, { getBreedsByState, getAllBreeds, getEndangeredBreeds } from '../data/breedData';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon creator
const createCustomIcon = (color, count) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      ">
        ${count}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// State coordinates for India
const STATE_COORDS = {
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Kerala': { lat: 10.8505, lng: 76.2711 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
};

// State climate data
const STATE_CLIMATE = {
  'Gujarat': 'Semi-arid to Arid',
  'Rajasthan': 'Arid Desert',
  'Punjab': 'Semi-arid',
  'Haryana': 'Semi-arid',
  'Maharashtra': 'Tropical',
  'Karnataka': 'Tropical',
  'Tamil Nadu': 'Tropical Wet',
  'Kerala': 'Tropical Monsoon',
  'Andhra Pradesh': 'Tropical',
  'Uttar Pradesh': 'Subtropical',
  'Madhya Pradesh': 'Subtropical',
  'Delhi': 'Semi-arid'
};

// Filter options
const FILTER_OPTIONS = {
  type: ['all', 'cattle', 'buffalo'],
  conservation: ['all', 'endangered', 'vulnerable', 'stable']
};

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterConservation, setFilterConservation] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState([22.5, 78.5]);
  const [mapZoom, setMapZoom] = useState(5);
  const [activeTab, setActiveTab] = useState('breeds');
  const [showLegend, setShowLegend] = useState(true);

  // Get all states with breeds
  const statesWithBreeds = useMemo(() => {
    return Object.keys(breedData.stateToBreeds);
  }, []);

  // Get filtered breeds for a state
  const getFilteredStateBreeds = useCallback((stateName) => {
    let breeds = getBreedsByState(stateName);
    
    if (filterType !== 'all') {
      breeds = breeds.filter(b => b.type === filterType);
    }
    
    if (filterConservation !== 'all') {
      breeds = breeds.filter(b => {
        const status = b.population?.conservationStatus?.toLowerCase() || '';
        if (filterConservation === 'endangered') {
          return status.includes('endangered');
        } else if (filterConservation === 'vulnerable') {
          return status.includes('vulnerable');
        } else if (filterConservation === 'stable') {
          return status.includes('not at risk') || status.includes('stable');
        }
        return true;
      });
    }
    
    return breeds;
  }, [filterType, filterConservation]);

  // Search filtered states
  const filteredStates = useMemo(() => {
    if (!searchQuery) return statesWithBreeds;
    return statesWithBreeds.filter(state => 
      state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getBreedsByState(state).some(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, statesWithBreeds]);

  // Calculate total stats
  const stats = useMemo(() => {
    const allBreeds = getAllBreeds();
    const endangeredBreeds = getEndangeredBreeds();
    const cattleBreeds = allBreeds.filter(b => b.type === 'cattle');
    const buffaloBreeds = allBreeds.filter(b => b.type === 'buffalo');
    
    return {
      totalBreeds: allBreeds.length,
      cattleBreeds: cattleBreeds.length,
      buffaloBreeds: buffaloBreeds.length,
      totalStates: statesWithBreeds.length,
      endangeredCount: endangeredBreeds.length,
      schemes: breedData.governmentSchemes?.length || 0
    };
  }, [statesWithBreeds]);

  // Handle state selection
  const handleStateSelect = (state) => {
    setSelectedState(state);
    const coords = STATE_COORDS[state];
    if (coords) {
      setMapCenter([coords.lat, coords.lng]);
      setMapZoom(7);
    }
  };

  // Get conservation status color
  const getConservationColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('critically')) return 'text-red-600 bg-red-50';
    if (s.includes('endangered')) return 'text-orange-600 bg-orange-50';
    if (s.includes('vulnerable')) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  // Map controls
  const handleZoomIn = () => setMapZoom(z => Math.min(z + 1, 10));
  const handleZoomOut = () => setMapZoom(z => Math.max(z - 1, 4));
  const handleReset = () => {
    setMapCenter([22.5, 78.5]);
    setMapZoom(5);
    setSelectedState(null);
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
            <Globe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {t('map.title', 'Indian Breed Distribution Map')}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            {t('map.subtitle', 'Explore native cattle and buffalo breeds across Indian states. Click on markers to discover regional breeds.')}
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { icon: BarChart3, label: 'Total Breeds', value: stats.totalBreeds, color: 'from-blue-500 to-blue-600' },
            { label: 'Cattle Breeds', value: stats.cattleBreeds, color: 'from-amber-500 to-orange-500', emoji: '🐄' },
            { label: 'Buffalo Breeds', value: stats.buffaloBreeds, color: 'from-gray-600 to-gray-700', emoji: '🐃' },
            { icon: MapPin, label: 'States Covered', value: stats.totalStates, color: 'from-green-500 to-emerald-600' },
            { icon: AlertTriangle, label: 'At Risk', value: stats.endangeredCount, color: 'from-red-500 to-rose-600' },
            { icon: Shield, label: 'Govt Schemes', value: stats.schemes, color: 'from-purple-500 to-violet-600' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4 border border-gray-100"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} mb-2`}>
                {stat.emoji ? (
                  <span className="text-lg">{stat.emoji}</span>
                ) : (
                  <stat.icon className="w-5 h-5 text-white" />
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search states or breeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                showFilters ? 'bg-green-50 border-green-200 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-4 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Animal Type</label>
                    <div className="flex flex-wrap gap-2">
                      {FILTER_OPTIONS.type.map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filterType === type
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {type === 'all' ? 'All' : type === 'cattle' ? '🐄 Cattle' : '🐃 Buffalo'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conservation Status</label>
                    <div className="flex flex-wrap gap-2">
                      {FILTER_OPTIONS.conservation.map(status => (
                        <button
                          key={status}
                          onClick={() => setFilterConservation(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filterConservation === status
                              ? 'bg-green-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Interactive Map</span>
                  {selectedState && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {selectedState}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleZoomIn} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Zoom In">
                    <ZoomIn className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={handleZoomOut} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Zoom Out">
                    <ZoomOut className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={handleReset} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors" title="Reset View">
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="h-[500px] relative">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <MapController center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {filteredStates.map((state) => {
                    const coords = STATE_COORDS[state];
                    if (!coords) return null;
                    
                    const filteredBreeds = getFilteredStateBreeds(state);
                    const breedCount = filteredBreeds.length;
                    if (breedCount === 0) return null;

                    const isSelected = selectedState === state;
                    const markerColor = isSelected ? '#059669' : '#10b981';

                    return (
                      <Marker
                        key={state}
                        position={[coords.lat, coords.lng]}
                        icon={createCustomIcon(markerColor, breedCount)}
                        eventHandlers={{
                          click: () => handleStateSelect(state),
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-lg text-gray-900 mb-2">{state}</h3>
                            <p className="text-sm text-gray-600 mb-2">{breedCount} native breeds</p>
                            {STATE_CLIMATE[state] && (
                              <p className="text-xs text-gray-500 mb-3">Climate: {STATE_CLIMATE[state]}</p>
                            )}
                            <div className="space-y-1">
                              {filteredBreeds.slice(0, 3).map(breed => (
                                <div key={breed.id} className="flex items-center gap-2 text-sm">
                                  <span>{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                                  <span>{breed.name}</span>
                                </div>
                              ))}
                              {filteredBreeds.length > 3 && (
                                <p className="text-xs text-green-600">+{filteredBreeds.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>

              {/* Legend */}
              <AnimatePresence>
                {showLegend && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Map Legend</span>
                        <button onClick={() => setShowLegend(false)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">N</div>
                          <span className="text-gray-600">Breed Count Marker</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">N</div>
                          <span className="text-gray-600">Selected State</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🐄🐃</span>
                          <span className="text-gray-600">Click for details</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!showLegend && (
                <button
                  onClick={() => setShowLegend(true)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                >
                  Show Legend
                </button>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <AnimatePresence mode="wait">
              {selectedState ? (
                <motion.div
                  key={selectedState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                >
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          {selectedState}
                        </h2>
                        <p className="text-green-100 text-sm mt-1">
                          {getFilteredStateBreeds(selectedState).length} native breeds
                        </p>
                        {STATE_CLIMATE[selectedState] && (
                          <p className="text-green-200 text-xs mt-1">
                            {STATE_CLIMATE[selectedState]} Climate
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => { setSelectedState(null); handleReset(); }}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex border-b border-gray-100">
                    {['breeds', 'stats', 'climate'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    {activeTab === 'breeds' && (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {getFilteredStateBreeds(selectedState).length > 0 ? (
                          getFilteredStateBreeds(selectedState).map((breed) => (
                            <Link
                              key={breed.id}
                              to={`/breed/${breed.id}`}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all border border-gray-100 hover:border-green-200 group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                                <div>
                                  <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                    {breed.name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500 capitalize">{breed.type}</span>
                                    {breed.population?.conservationStatus && (
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getConservationColor(breed.population.conservationStatus)}`}>
                                        {breed.population.conservationStatus}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ExternalLink size={16} className="text-gray-400 group-hover:text-green-600 transition-colors" />
                            </Link>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Info className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No breeds match your filters</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'stats' && (
                      <div className="space-y-4">
                        {(() => {
                          const breeds = getBreedsByState(selectedState);
                          const cattleCount = breeds.filter(b => b.type === 'cattle').length;
                          const buffaloCount = breeds.filter(b => b.type === 'buffalo').length;
                          const endangered = breeds.filter(b => 
                            b.population?.conservationStatus?.toLowerCase().includes('endangered') ||
                            b.population?.conservationStatus?.toLowerCase().includes('vulnerable')
                          ).length;
                          
                          return (
                            <>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="bg-amber-50 rounded-xl p-4 text-center">
                                  <span className="text-3xl">🐄</span>
                                  <p className="text-2xl font-bold text-amber-700">{cattleCount}</p>
                                  <p className="text-xs text-amber-600">Cattle Breeds</p>
                                </div>
                                <div className="bg-gray-100 rounded-xl p-4 text-center">
                                  <span className="text-3xl">🐃</span>
                                  <p className="text-2xl font-bold text-gray-700">{buffaloCount}</p>
                                  <p className="text-xs text-gray-600">Buffalo Breeds</p>
                                </div>
                              </div>
                              {endangered > 0 && (
                                <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
                                  <AlertTriangle className="w-8 h-8 text-red-500" />
                                  <div>
                                    <p className="font-semibold text-red-700">{endangered} At-Risk Breed{endangered > 1 ? 's' : ''}</p>
                                    <p className="text-xs text-red-600">Require conservation efforts</p>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'climate' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <h4 className="font-medium text-blue-800 flex items-center gap-2">
                            <Leaf className="w-4 h-4" />
                            Climate Zone
                          </h4>
                          <p className="text-lg font-semibold text-blue-700 mt-1">
                            {STATE_CLIMATE[selectedState] || 'Varied'}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-medium text-green-800 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Sustainability Score
                          </h4>
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-green-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }} />
                              </div>
                              <span className="text-sm font-medium text-green-700">High</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin size={32} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{t('map.selectState', 'Select a State')}</h3>
                  <p className="text-sm text-gray-500 mt-2">{t('map.clickToExplore', 'Click on any marker on the map to explore native cattle and buffalo breeds.')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* States List */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  All States
                </h3>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto">
                <div className="space-y-1">
                  {filteredStates.map((state) => {
                    const breedCount = getFilteredStateBreeds(state).length;
                    return (
                      <button
                        key={state}
                        onClick={() => handleStateSelect(state)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                          selectedState === state
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`font-medium ${selectedState === state ? 'text-white' : 'text-gray-800'}`}>
                          {state}
                        </span>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          selectedState === state ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                        }`}>
                          {breedCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conservation Alert */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">Conservation Alert</h4>
                  <p className="text-sm text-red-100 mt-1">
                    {stats.endangeredCount} indigenous breeds are at risk.
                  </p>
                  <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-white mt-3 hover:underline">
                    View at-risk breeds <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
