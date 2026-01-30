import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, X, ExternalLink, Filter, Search, ChevronDown, ChevronUp,
  AlertTriangle, TrendingUp, ZoomIn, ZoomOut, RotateCcw, Layers,
  Info, Globe, BarChart3, Shield, Leaf, Compass, Navigation,
  Eye, Map, Satellite, Mountain, Droplets, Sun, Thermometer
} from 'lucide-react';
import breedData, { getBreedsByState, getAllBreeds, getEndangeredBreeds } from '../data/breedData';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map tile layers
const MAP_TILES = {
  default: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    name: 'Standard',
    icon: Map
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    name: 'Satellite',
    icon: Satellite
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    name: 'Terrain',
    icon: Mountain
  },
  dark: {
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; Stadia Maps',
    name: 'Dark',
    icon: Eye
  }
};

// Custom animated marker icon creator
const createCustomIcon = (color, count, isSelected, hasEndangered) => {
  const size = isSelected ? 48 : 40;
  const pulseColor = hasEndangered ? '#ef4444' : color;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container" style="position: relative; width: ${size}px; height: ${size}px;">
        ${hasEndangered ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size + 20}px;
            height: ${size + 20}px;
            border-radius: 50%;
            background: ${pulseColor}30;
            animation: pulse 2s ease-in-out infinite;
          "></div>
        ` : ''}
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, ${color}, ${color}dd);
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '16px' : '14px'};
          border: ${isSelected ? '4px' : '3px'} solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3), 0 0 0 ${isSelected ? '4px' : '2px'} ${color}40;
          transition: all 0.3s ease;
          cursor: pointer;
        ">
          ${count}
        </div>
        ${isSelected ? `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${size + 12}px;
            height: ${size + 12}px;
            border-radius: 50%;
            border: 2px dashed ${color};
            animation: rotate 10s linear infinite;
          "></div>
        ` : ''}
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.2; }
        }
        @keyframes rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      </style>
    `,
    iconSize: [size + 24, size + 24],
    iconAnchor: [(size + 24) / 2, (size + 24) / 2],
    popupAnchor: [0, -size / 2],
  });
};

// State coordinates for India with additional metadata
const STATE_COORDS = {
  'Gujarat': { lat: 22.2587, lng: 71.1924, region: 'West' },
  'Rajasthan': { lat: 27.0238, lng: 74.2179, region: 'North' },
  'Punjab': { lat: 31.1471, lng: 75.3412, region: 'North' },
  'Haryana': { lat: 29.0588, lng: 76.0856, region: 'North' },
  'Maharashtra': { lat: 19.7515, lng: 75.7139, region: 'West' },
  'Karnataka': { lat: 15.3173, lng: 75.7139, region: 'South' },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569, region: 'South' },
  'Kerala': { lat: 10.8505, lng: 76.2711, region: 'South' },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400, region: 'South' },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462, region: 'North' },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569, region: 'Central' },
  'Delhi': { lat: 28.7041, lng: 77.1025, region: 'North' },
};

// State climate data with more details
const STATE_CLIMATE = {
  'Gujarat': { type: 'Semi-arid to Arid', temp: '25-42°C', rainfall: '500-1000mm', icon: Sun },
  'Rajasthan': { type: 'Arid Desert', temp: '25-48°C', rainfall: '300-650mm', icon: Sun },
  'Punjab': { type: 'Semi-arid', temp: '15-40°C', rainfall: '500-750mm', icon: Droplets },
  'Haryana': { type: 'Semi-arid', temp: '15-45°C', rainfall: '450-900mm', icon: Thermometer },
  'Maharashtra': { type: 'Tropical', temp: '20-35°C', rainfall: '700-3000mm', icon: Droplets },
  'Karnataka': { type: 'Tropical', temp: '18-35°C', rainfall: '500-4000mm', icon: Droplets },
  'Tamil Nadu': { type: 'Tropical Wet', temp: '22-38°C', rainfall: '800-1200mm', icon: Droplets },
  'Kerala': { type: 'Tropical Monsoon', temp: '22-33°C', rainfall: '2000-3500mm', icon: Droplets },
  'Andhra Pradesh': { type: 'Tropical', temp: '20-40°C', rainfall: '500-1200mm', icon: Sun },
  'Uttar Pradesh': { type: 'Subtropical', temp: '10-45°C', rainfall: '600-1000mm', icon: Thermometer },
  'Madhya Pradesh': { type: 'Subtropical', temp: '15-45°C', rainfall: '800-1800mm', icon: Thermometer },
  'Delhi': { type: 'Semi-arid', temp: '10-45°C', rainfall: '600-800mm', icon: Thermometer }
};

// Region colors for visual distinction
const REGION_COLORS = {
  'North': '#3b82f6',
  'South': '#10b981',
  'East': '#f59e0b',
  'West': '#8b5cf6',
  'Central': '#ec4899'
};

// Filter options
const FILTER_OPTIONS = {
  type: ['all', 'cattle', 'buffalo'],
  conservation: ['all', 'endangered', 'vulnerable', 'stable'],
  region: ['all', 'North', 'South', 'East', 'West', 'Central']
};

// Breed images from Wikimedia Commons
const BREED_IMAGES = {
  cattle: {
    gir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gir_01.JPG/200px-Gir_01.JPG',
    sahiwal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sahiwal_cattle_in_Pakistan.jpg/200px-Sahiwal_cattle_in_Pakistan.jpg',
    kankrej: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kankrej_Cow_Gujarat.jpg/200px-Kankrej_Cow_Gujarat.jpg',
    tharparkar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Tharparkar_Cattle_%28JLPS%29.jpg/200px-Tharparkar_Cattle_%28JLPS%29.jpg',
    ongole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Ongole_bull.JPG/200px-Ongole_bull.JPG',
    hariana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Hariana_bull.jpg/200px-Hariana_bull.jpg',
  },
  buffalo: {
    murrah: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Murrah_buffalo_in_PCC.jpg/200px-Murrah_buffalo_in_PCC.jpg',
    mehsana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Mehsana_buffalo.jpg/200px-Mehsana_buffalo.jpg',
    jaffarabadi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Jafarabadi_buffalo.jpg/200px-Jafarabadi_buffalo.jpg',
  }
};

// Get breed image
const getBreedImage = (breed) => {
  return BREED_IMAGES[breed.type]?.[breed.id] || null;
};

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.5 });
  }, [center, zoom, map]);
  return null;
}

// Compass component
function CompassControl() {
  const map = useMap();
  const [rotation, setRotation] = useState(0);
  
  useEffect(() => {
    const updateRotation = () => setRotation(0); // Always north-up for now
    map.on('rotate', updateRotation);
    return () => map.off('rotate', updateRotation);
  }, [map]);

  const handleNorthClick = () => {
    map.setView(map.getCenter(), map.getZoom());
  };

  return (
    <div 
      onClick={handleNorthClick}
      className="absolute top-4 right-4 z-[1000] w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-all border border-gray-200"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <Compass className="w-6 h-6 text-gray-700" />
      <div className="absolute -top-1 w-2 h-2 bg-red-500 rounded-full" />
    </div>
  );
}

export default function MapPage() {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterConservation, setFilterConservation] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [mapCenter, setMapCenter] = useState([22.5, 78.5]);
  const [mapZoom, setMapZoom] = useState(5);
  const [activeTab, setActiveTab] = useState('breeds');
  const [showLegend, setShowLegend] = useState(true);
  const [mapStyle, setMapStyle] = useState('default');
  const [showMapStyles, setShowMapStyles] = useState(false);
  const [hoveredState, setHoveredState] = useState(null);
  const mapRef = useRef(null);

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
    let states = statesWithBreeds;
    
    // Filter by region
    if (filterRegion !== 'all') {
      states = states.filter(state => STATE_COORDS[state]?.region === filterRegion);
    }
    
    // Filter by search
    if (searchQuery) {
      states = states.filter(state => 
        state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getBreedsByState(state).some(b => 
          b.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    return states;
  }, [searchQuery, statesWithBreeds, filterRegion]);

  // Check if state has endangered breeds
  const stateHasEndangered = useCallback((stateName) => {
    const breeds = getBreedsByState(stateName);
    return breeds.some(b => {
      const status = b.population?.conservationStatus?.toLowerCase() || '';
      return status.includes('endangered') || status.includes('critical');
    });
  }, []);

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

  // Get breed image
  const getBreedImage = (breed) => {
    // Check BREED_IMAGES first
    const imageKey = breed.name?.toLowerCase().replace(/\s+/g, '-');
    if (BREED_IMAGES[imageKey]) return BREED_IMAGES[imageKey];
    // Fallback to breed data image
    if (breed.images?.main) return breed.images.main;
    if (breed.image) return breed.image;
    return null;
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-6"
            >
              <Globe className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                {t('map.title', 'Breed Distribution Map')}
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('map.subtitle', 'Discover the rich heritage of Indian cattle and buffalo breeds across different states.')}
            </p>
          </motion.div>

          {/* Interactive Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            {[
              { icon: BarChart3, label: 'Total Breeds', value: stats.totalBreeds, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
              { label: 'Cattle', value: stats.cattleBreeds, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', emoji: '🐄' },
              { label: 'Buffalo', value: stats.buffaloBreeds, color: 'from-slate-600 to-gray-800', bg: 'bg-slate-50', emoji: '🐃' },
              { icon: MapPin, label: 'States', value: stats.totalStates, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
              { icon: AlertTriangle, label: 'At Risk', value: stats.endangeredCount, color: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
              { icon: Shield, label: 'Schemes', value: stats.schemes, color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`${stat.bg} backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg mb-3`}>
                  {stat.emoji ? (
                    <span className="text-2xl">{stat.emoji}</span>
                  ) : (
                    <stat.icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 mb-8 border border-white/50"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search states or breeds..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all ${
                  showFilters 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-white/80 border border-gray-200 text-gray-700 hover:bg-gray-50'
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 mt-6 border-t border-gray-200/50">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Animal Type</label>
                      <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.type.map(type => (
                          <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              filterType === type
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {type === 'all' ? 'All' : type === 'cattle' ? '🐄 Cattle' : '🐃 Buffalo'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Conservation Status</label>
                      <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.conservation.map(status => (
                          <button
                            key={status}
                            onClick={() => setFilterConservation(status)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              filterConservation === status
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Region</label>
                      <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.region.map(region => (
                          <button
                            key={region}
                            onClick={() => setFilterRegion(region)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              filterRegion === region
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {region === 'all' ? 'All Regions' : region}
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
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50">
                {/* Map Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-800">Interactive Map</span>
                      {selectedState && (
                        <span className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                          📍 {selectedState}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Map Style Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowMapStyles(!showMapStyles)}
                        className="p-2.5 rounded-xl bg-white hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm"
                        title="Change Map Style"
                      >
                        <Layers className="w-4 h-4 text-gray-600" />
                      </button>
                      <AnimatePresence>
                        {showMapStyles && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 min-w-[150px]"
                          >
                            {Object.entries(MAP_TILES).map(([key, tile]) => (
                              <button
                                key={key}
                                onClick={() => { setMapStyle(key); setShowMapStyles(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  mapStyle === key ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <tile.icon className="w-4 h-4" />
                                {tile.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                      <button onClick={handleZoomIn} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={handleZoomOut} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4 text-gray-600" />
                      </button>
                      <button onClick={handleReset} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Reset View">
                        <RotateCcw className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Leaflet Map */}
                <div className="h-[550px] relative">
                  <MapContainer
                    ref={mapRef}
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    className="z-0"
                  >
                    <MapController center={mapCenter} zoom={mapZoom} />
                    <CompassControl />
                    <TileLayer
                      attribution={MAP_TILES[mapStyle].attribution}
                      url={MAP_TILES[mapStyle].url}
                    />
                    
                    {filteredStates.map((state) => {
                      const coords = STATE_COORDS[state];
                      if (!coords) return null;
                      
                      const filteredBreeds = getFilteredStateBreeds(state);
                      const breedCount = filteredBreeds.length;
                      if (breedCount === 0) return null;

                      const isSelected = selectedState === state;
                      const hasEndangered = stateHasEndangered(state);
                      const regionColor = REGION_COLORS[coords.region] || '#10b981';

                      return (
                        <Marker
                          key={state}
                          position={[coords.lat, coords.lng]}
                          icon={createCustomIcon(regionColor, breedCount, isSelected, hasEndangered)}
                          eventHandlers={{
                            click: () => handleStateSelect(state),
                          }}
                        >
                          <Popup className="custom-popup">
                            <div className="p-3 min-w-[250px]">
                              <div className="flex items-center gap-3 mb-3">
                                <div 
                                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                  style={{ background: `linear-gradient(135deg, ${regionColor}, ${regionColor}dd)` }}
                                >
                                  {breedCount}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900">{state}</h3>
                                  <p className="text-sm text-gray-500">{coords.region} India</p>
                                </div>
                              </div>
                              
                              {STATE_CLIMATE[state] && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">
                                  <Thermometer className="w-4 h-4" />
                                  <span>{STATE_CLIMATE[state].type}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{STATE_CLIMATE[state].temp}</span>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                {filteredBreeds.slice(0, 4).map(breed => (
                                  <div key={breed.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                    <span className="text-xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                                    <span className="font-medium text-gray-800">{breed.name}</span>
                                    {breed.population?.conservationStatus?.toLowerCase().includes('endangered') && (
                                      <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">At Risk</span>
                                    )}
                                  </div>
                                ))}
                                {filteredBreeds.length > 4 && (
                                  <p className="text-sm text-emerald-600 font-medium text-center pt-1">
                                    +{filteredBreeds.length - 4} more breeds
                                  </p>
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
                      className="border-t border-gray-100 bg-gradient-to-r from-gray-50/80 to-white/80"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-semibold text-gray-800">Map Legend</span>
                          <button onClick={() => setShowLegend(false)} className="text-gray-400 hover:text-gray-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                          {Object.entries(REGION_COLORS).map(([region, color]) => (
                            <div key={region} className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md"
                                style={{ background: color }}
                              >
                                N
                              </div>
                              <span className="text-gray-600">{region}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center relative">
                              <div className="w-4 h-4 rounded-full bg-red-500 animate-ping absolute" />
                              <div className="w-4 h-4 rounded-full bg-red-500" />
                            </div>
                            <span className="text-gray-600">At Risk</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!showLegend && (
                  <button
                    onClick={() => setShowLegend(true)}
                    className="w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
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
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50"
                >
                  {/* State Header with Gradient */}
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600" />
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                    <div className="relative p-6 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <span className="text-emerald-100 text-sm font-medium">{STATE_COORDS[selectedState]?.region} Region</span>
                          </div>
                          <h2 className="text-2xl font-bold">{selectedState}</h2>
                          <p className="text-emerald-100 text-sm mt-1">
                            {getFilteredStateBreeds(selectedState).length} native breeds found
                          </p>
                        </div>
                        <button
                          onClick={() => { setSelectedState(null); handleReset(); }}
                          className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      
                      {/* Climate Quick Info */}
                      {STATE_CLIMATE[selectedState] && (
                        <div className="flex gap-3 mt-4">
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            <span className="text-sm">{STATE_CLIMATE[selectedState].temp}</span>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            <span className="text-sm">{STATE_CLIMATE[selectedState].rainfall}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-100 bg-gray-50/50">
                    {['breeds', 'stats', 'climate'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-sm font-semibold transition-all ${
                          activeTab === tab
                            ? 'text-emerald-600 border-b-2 border-emerald-500 bg-white'
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
                          getFilteredStateBreeds(selectedState).map((breed) => {
                            const breedImage = getBreedImage(breed);
                            return (
                              <Link
                                key={breed.id}
                                to={`/breed/${breed.id}`}
                                className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:from-emerald-50 hover:to-teal-50 transition-all border border-gray-100 hover:border-emerald-200 hover:shadow-md group"
                              >
                                {/* Breed Image or Emoji */}
                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                  {breedImage ? (
                                    <img 
                                      src={breedImage} 
                                      alt={breed.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                  ) : null}
                                  <span className={`text-3xl ${breedImage ? 'hidden' : 'flex'}`}>
                                    {breed.type === 'cattle' ? '🐄' : '🐃'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
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
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                              </Link>
                            );
                          })
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
                                <motion.div 
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 text-center border border-amber-100"
                                >
                                  <span className="text-4xl block mb-2">🐄</span>
                                  <p className="text-3xl font-bold text-amber-700">{cattleCount}</p>
                                  <p className="text-sm text-amber-600 font-medium">Cattle Breeds</p>
                                </motion.div>
                                <motion.div 
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-4 text-center border border-slate-200"
                                >
                                  <span className="text-4xl block mb-2">🐃</span>
                                  <p className="text-3xl font-bold text-slate-700">{buffaloCount}</p>
                                  <p className="text-sm text-slate-600 font-medium">Buffalo Breeds</p>
                                </motion.div>
                              </div>
                              {endangered > 0 && (
                                <motion.div 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-4 flex items-center gap-4 border border-red-100"
                                >
                                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-red-700 text-lg">{endangered} At-Risk</p>
                                    <p className="text-sm text-red-600">Require conservation</p>
                                  </div>
                                </motion.div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {activeTab === 'climate' && (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                          <div className="flex items-center gap-3 mb-3">
                            {STATE_CLIMATE[selectedState] && (() => {
                              const IconComponent = STATE_CLIMATE[selectedState].icon;
                              return IconComponent ? <IconComponent className="w-6 h-6 text-blue-500" /> : null;
                            })()}
                            <h4 className="font-semibold text-blue-800">Climate Zone</h4>
                          </div>
                          <p className="text-xl font-bold text-blue-700">
                            {STATE_CLIMATE[selectedState]?.type || 'Varied'}
                          </p>
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="bg-white/60 rounded-xl p-3">
                              <p className="text-xs text-blue-600 font-medium">Temperature</p>
                              <p className="text-sm font-semibold text-blue-800">{STATE_CLIMATE[selectedState]?.temp || 'N/A'}</p>
                            </div>
                            <div className="bg-white/60 rounded-xl p-3">
                              <p className="text-xs text-blue-600 font-medium">Rainfall</p>
                              <p className="text-sm font-semibold text-blue-800">{STATE_CLIMATE[selectedState]?.rainfall || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                          <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5" />
                            Sustainability Score
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-green-200/50 rounded-full h-3 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '80%' }}
                                transition={{ duration: 1, delay: 0.3 }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" 
                              />
                            </div>
                            <span className="text-lg font-bold text-green-700">80%</span>
                          </div>
                          <p className="text-sm text-green-600 mt-2">Indigenous breeds well-adapted to local conditions</p>
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
                  className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 text-center border border-white/50"
                >
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <MapPin size={40} className="text-emerald-600" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 text-xl mb-2">{t('map.selectState', 'Select a State')}</h3>
                  <p className="text-gray-500 leading-relaxed">{t('map.clickToExplore', 'Click on any marker on the map to explore native cattle and buffalo breeds.')}</p>
                  
                  {/* Quick Tips */}
                  <div className="mt-6 p-4 bg-emerald-50 rounded-2xl text-left">
                    <p className="text-sm font-semibold text-emerald-800 mb-2">💡 Quick Tips</p>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Use filters to narrow down breeds</li>
                      <li>• Colors indicate different regions</li>
                      <li>• Pulsing markers have at-risk breeds</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* States List */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-white/50">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-teal-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  All States ({filteredStates.length})
                </h3>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {filteredStates.map((state) => {
                    const breedCount = getFilteredStateBreeds(state).length;
                    const coords = STATE_COORDS[state];
                    const regionColor = REGION_COLORS[coords?.region] || '#10b981';
                    const hasEndangered = stateHasEndangered(state);
                    
                    return (
                      <motion.button
                        key={state}
                        whileHover={{ x: 4 }}
                        onClick={() => handleStateSelect(state)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                          selectedState === state
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                            : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedState === state ? '#fff' : regionColor }}
                          />
                          <span className={`font-medium ${selectedState === state ? 'text-white' : 'text-gray-800'}`}>
                            {state}
                          </span>
                          {hasEndangered && selectedState !== state && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                          selectedState === state 
                            ? 'bg-white/20 text-white' 
                            : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
                        }`}>
                          {breedCount}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conservation Alert */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 rounded-3xl shadow-xl p-6 text-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Conservation Alert</h4>
                  <p className="text-red-100 mt-1">
                    {stats.endangeredCount} indigenous breeds need our protection.
                  </p>
                  <Link 
                    to="/explore?filter=endangered" 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white mt-4 px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                  >
                    View at-risk breeds <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
