import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import breedData from '../data/breedData';

// Real Indian cattle/buffalo breed images from Wikimedia Commons
const BREED_IMAGES = {
  cattle: {
    gir: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Gir_01.JPG/100px-Gir_01.JPG',
    sahiwal: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Sahiwal_cattle_in_Pakistan.jpg/100px-Sahiwal_cattle_in_Pakistan.jpg',
    redSindhi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Sindhi_cow.JPG/100px-Sindhi_cow.JPG',
    tharparkar: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Tharparkar_Cattle_%28JLPS%29.jpg/100px-Tharparkar_Cattle_%28JLPS%29.jpg',
    kankrej: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Kankrej_Cow_Gujarat.jpg/100px-Kankrej_Cow_Gujarat.jpg',
    ongole: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Ongole_bull.JPG/100px-Ongole_bull.JPG',
    hariana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Hariana_bull.jpg/100px-Hariana_bull.jpg',
  },
  buffalo: {
    murrah: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Murrah_buffalo_in_PCC.jpg/100px-Murrah_buffalo_in_PCC.jpg',
    mehsana: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Mehsana_buffalo.jpg/100px-Mehsana_buffalo.jpg',
    jaffarabadi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Jafarabadi_buffalo.jpg/100px-Jafarabadi_buffalo.jpg',
  }
};

const getBreedImage = (breed) => {
  if (!breed) return null;
  return BREED_IMAGES[breed.type]?.[breed.id] || null;
};

const getBreedGradient = (breed) => {
  const cattleGradients = ['from-amber-500 to-orange-600', 'from-orange-500 to-red-600', 'from-yellow-500 to-amber-600'];
  const buffaloGradients = ['from-slate-700 to-gray-900', 'from-gray-700 to-slate-900', 'from-zinc-700 to-neutral-900'];
  const gradients = breed?.type === 'cattle' ? cattleGradients : buffaloGradients;
  const hash = (breed?.name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `bg-gradient-to-br ${gradients[hash % gradients.length]}`;
};

export default function CompareFloatingBar() {
  const { selectedBreeds, removeBreed, clearAll } = useCompare();
  const location = useLocation();

  // Don't show on compare page
  if (location.pathname === '/compare' || selectedBreeds.length === 0) {
    return null;
  }

  const getBreedData = (id) => {
    return breedData.cattle[id] || breedData.buffalo[id];
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Scale className="w-5 h-5 text-primary-600" />
            <span className="font-semibold">Compare</span>
            <span className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-sm font-medium">
              {selectedBreeds.length}/4
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedBreeds.map((breedId) => {
              const breed = getBreedData(breedId);
              if (!breed) return null;
              const gradientClass = getBreedGradient(breed);
              return (
                <motion.div
                  key={breedId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative group"
                >
                <div className={`w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md ${gradientClass}`}>
                    {getBreedImage(breed) ? (
                      <img
                        src={getBreedImage(breed)}
                        alt={breed.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xl">{breed.type === 'cattle' ? '🐄' : '🐃'}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeBreed(breedId)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {breed.name}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={clearAll}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Clear all"
            >
              <X className="w-5 h-5" />
            </button>
            <Link
              to="/compare"
              className="bg-gradient-to-r from-primary-600 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:shadow-lg transition-all"
            >
              Compare Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
