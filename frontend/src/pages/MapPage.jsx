import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { MapPin, X, ExternalLink } from 'lucide-react';
import breedData, { getBreedsByState, getBreedById } from '../data/breedData';

// India TopoJSON URL
const INDIA_TOPO_JSON = 'https://raw.githubusercontent.com/Subhash9325/GeospatialData-of-India/master/Indian_States.topojson';

// State centers for markers (approximate coordinates)
const STATE_CENTERS = {
  'Gujarat': [71.1924, 22.2587],
  'Rajasthan': [74.2179, 27.0238],
  'Punjab': [75.3412, 31.1471],
  'Haryana': [76.0856, 29.0588],
  'Maharashtra': [75.7139, 19.7515],
  'Karnataka': [75.7139, 15.3173],
  'Tamil Nadu': [78.6569, 11.1271],
  'Kerala': [76.2711, 10.8505],
  'Andhra Pradesh': [79.7400, 15.9129],
  'Uttar Pradesh': [80.9462, 26.8467],
  'Madhya Pradesh': [78.6569, 22.9734],
  'Delhi': [77.1025, 28.7041]
};

// State name mappings (TopoJSON names to our data names)
const STATE_NAME_MAP = {
  'GUJARAT': 'Gujarat',
  'RAJASTHAN': 'Rajasthan',
  'PUNJAB': 'Punjab',
  'HARYANA': 'Haryana',
  'MAHARASHTRA': 'Maharashtra',
  'KARNATAKA': 'Karnataka',
  'TAMIL NADU': 'Tamil Nadu',
  'KERALA': 'Kerala',
  'ANDHRA PRADESH': 'Andhra Pradesh',
  'UTTAR PRADESH': 'Uttar Pradesh',
  'MADHYA PRADESH': 'Madhya Pradesh',
  'NCT OF DELHI': 'Delhi',
  'DELHI': 'Delhi'
};

export default function MapPage() {
  const { t } = useTranslation();
  const [selectedState, setSelectedState] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);

  const statesWithBreeds = useMemo(() => {
    return Object.keys(breedData.stateToBreeds);
  }, []);

  const getStateBreeds = (stateName) => {
    return getBreedsByState(stateName);
  };

  const handleStateClick = (geo) => {
    const stateName = geo.properties?.ST_NM || geo.properties?.NAME;
    const normalizedName = STATE_NAME_MAP[stateName?.toUpperCase()] || stateName;
    
    if (statesWithBreeds.includes(normalizedName)) {
      setSelectedState(normalizedName);
    }
  };

  const getStateColor = (geo) => {
    const stateName = geo.properties?.ST_NM || geo.properties?.NAME;
    const normalizedName = STATE_NAME_MAP[stateName?.toUpperCase()] || stateName;
    
    if (selectedState === normalizedName) {
      return '#059669'; // Primary green for selected
    }
    if (hoveredState === normalizedName) {
      return '#10b981'; // Lighter green for hover
    }
    if (statesWithBreeds.includes(normalizedName)) {
      return '#d1fae5'; // Very light green for states with breeds
    }
    return '#f3f4f6'; // Gray for other states
  };

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
            <MapPin className="text-primary-600" />
            <span>{t('map.title')}</span>
          </h1>
          <p className="text-gray-600 mt-2">{t('map.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 card p-4"
          >
            <div className="aspect-square lg:aspect-[4/3]">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  scale: 1000,
                  center: [82, 22]
                }}
                style={{ width: '100%', height: '100%' }}
              >
                <Geographies geography={INDIA_TOPO_JSON}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const stateName = geo.properties?.ST_NM || geo.properties?.NAME;
                      const normalizedName = STATE_NAME_MAP[stateName?.toUpperCase()] || stateName;
                      const hasBreeds = statesWithBreeds.includes(normalizedName);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getStateColor(geo)}
                          stroke="#ffffff"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { 
                              outline: 'none',
                              cursor: hasBreeds ? 'pointer' : 'default'
                            },
                            pressed: { outline: 'none' }
                          }}
                          onMouseEnter={() => {
                            if (hasBreeds) setHoveredState(normalizedName);
                          }}
                          onMouseLeave={() => setHoveredState(null)}
                          onClick={() => handleStateClick(geo)}
                        />
                      );
                    })
                  }
                </Geographies>

                {/* State markers */}
                {statesWithBreeds.map((state) => {
                  const coords = STATE_CENTERS[state];
                  if (!coords) return null;
                  const breedCount = breedData.stateToBreeds[state]?.length || 0;
                  
                  return (
                    <Marker key={state} coordinates={coords}>
                      <circle
                        r={8}
                        fill={selectedState === state ? '#059669' : '#10b981'}
                        stroke="#fff"
                        strokeWidth={2}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedState(state)}
                      />
                      <text
                        textAnchor="middle"
                        y={-12}
                        style={{
                          fontFamily: 'system-ui',
                          fontSize: '10px',
                          fill: '#374151',
                          fontWeight: 500
                        }}
                      >
                        {breedCount}
                      </text>
                    </Marker>
                  );
                })}
              </ComposableMap>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
                <span className="text-gray-600">Has Native Breeds</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-primary-600" />
                <span className="text-gray-600">Selected</span>
              </div>
            </div>
          </motion.div>

          {/* Sidebar - State Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {selectedState ? (
                <motion.div
                  key={selectedState}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="card"
                >
                  <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedState}</h2>
                      <p className="text-primary-100 text-sm">
                        {getStateBreeds(selectedState).length} native breeds
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedState(null)}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {getStateBreeds(selectedState).map((breed) => (
                      <Link
                        key={breed.id}
                        to={`/breed/${breed.id}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {breed.type === 'cattle' ? '🐄' : '🐃'}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{breed.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{breed.type}</p>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-6 text-center"
                >
                  <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="font-semibold text-gray-700">{t('map.selectState')}</h3>
                  <p className="text-sm text-gray-500 mt-2">{t('map.clickToExplore')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Stats */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {Object.keys(breedData.cattle).length}
                  </p>
                  <p className="text-xs text-gray-600">Cattle Breeds</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {Object.keys(breedData.buffalo).length}
                  </p>
                  <p className="text-xs text-gray-600">Buffalo Breeds</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">
                    {statesWithBreeds.length}
                  </p>
                  <p className="text-xs text-gray-600">States</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {breedData.governmentSchemes?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Govt Schemes</p>
                </div>
              </div>
            </div>

            {/* States List */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">All States</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {statesWithBreeds.map((state) => (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedState === state
                        ? 'bg-primary-100 text-primary-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{state}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({breedData.stateToBreeds[state]?.length || 0})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
