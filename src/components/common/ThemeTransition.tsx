import React, { useEffect, useState } from 'react';

interface ThemeTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

const ThemeTransition: React.FC<ThemeTransitionProps> = ({ isActive, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Wavy overlay layers */}
      <div className="absolute inset-0 wave-layer-1"></div>
      <div className="absolute inset-0 wave-layer-2"></div>
      <div className="absolute inset-0 wave-layer-3"></div>
      
      {/* Sparkle effects */}
      <div className="absolute inset-0 sparkle-container">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ThemeTransition;
