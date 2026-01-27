import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

const STORAGE_KEY = 'breed-compare-selection';
const MAX_BREEDS = 4;

export function CompareProvider({ children }) {
  const [selectedBreeds, setSelectedBreeds] = useState(() => {
    // Load from localStorage on initial render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedBreeds));
  }, [selectedBreeds]);

  const addBreed = (breedId) => {
    if (selectedBreeds.length < MAX_BREEDS && !selectedBreeds.includes(breedId)) {
      setSelectedBreeds(prev => [...prev, breedId]);
      return true;
    }
    return false;
  };

  const removeBreed = (breedId) => {
    setSelectedBreeds(prev => prev.filter(id => id !== breedId));
  };

  const toggleBreed = (breedId) => {
    if (selectedBreeds.includes(breedId)) {
      removeBreed(breedId);
      return false;
    } else {
      return addBreed(breedId);
    }
  };

  const clearAll = () => {
    setSelectedBreeds([]);
  };

  const isSelected = (breedId) => selectedBreeds.includes(breedId);

  const canAddMore = selectedBreeds.length < MAX_BREEDS;

  return (
    <CompareContext.Provider value={{
      selectedBreeds,
      addBreed,
      removeBreed,
      toggleBreed,
      clearAll,
      isSelected,
      canAddMore,
      maxBreeds: MAX_BREEDS
    }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

export default CompareContext;
