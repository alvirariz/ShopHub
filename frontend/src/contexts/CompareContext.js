import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext();

export const useCompare = () => {
  return useContext(CompareContext);
};

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState(() => {
    // Try to initialize from localStorage so it persists across hard reloads
    const saved = localStorage.getItem('compareList');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  const toggleCompare = (product) => {
    setCompareList((prev) => {
      // If already in list, remove it
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      
      // If adding new, check limit
      if (prev.length >= 4) {
        alert('You can only compare up to 4 products at a time.');
        return prev;
      }
      
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isSelected = (productId) => {
    return compareList.some((p) => p.id === productId);
  };

  return (
    <CompareContext.Provider 
      value={{ 
        compareList, 
        toggleCompare, 
        removeFromCompare, 
        clearCompare,
        isSelected
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
