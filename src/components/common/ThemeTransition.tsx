import React, { useEffect, useState } from 'react';

interface ThemeTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

/**
 * Short, professional theme switch affordance: frosted blur + gentle fade
 * (replaces the previous high-contrast wave/sparkle “flash” effect).
 */
const ThemeTransition: React.FC<ThemeTransitionProps> = ({ isActive, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 320);
      }, 780);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden
    >
      <div className="theme-transition-veil absolute inset-0" />
    </div>
  );
};

export default ThemeTransition;
