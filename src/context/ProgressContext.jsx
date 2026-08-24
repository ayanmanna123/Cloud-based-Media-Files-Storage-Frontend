import { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isUploading, setIsUploading] = useState(false);

  const startUpload = () => {
    setIsUploading(true);
    setProgress(0);
  };

  const updateProgress = (val) => {
    // Ensure progress stays between 0 and 100
    setProgress(Math.min(Math.max(val, 0), 100));
  };

  const completeUpload = () => {
    setProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 300); // Reset after fade out
    }, 500); // Wait for transition to finish
  };

  useEffect(() => {
    if (isUploading) {
      const barLength = 10;
      const filled = Math.round((progress / 100) * barLength);
      const empty = barLength - filled;
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      document.title = `[${bar}] ${Math.round(progress)}% - CloudBox`;
    } else {
      document.title = "CloudBox - Secure Cloud Storage";
    }
  }, [progress, isUploading]);

  return (
    <ProgressContext.Provider value={{ progress, isUploading, startUpload, updateProgress, completeUpload }}>
      {children}
    </ProgressContext.Provider>
  );
}

export const useProgress = () => useContext(ProgressContext);
