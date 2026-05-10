import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

export default function ToastNotification({ isVisible, message }) {
  // Local state to handle the slide-out animation before unmounting
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      // Delay removing from DOM to allow slide-out animation to finish
      const timeout = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
        isVisible 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-emerald-500 text-white px-6 py-3.5 rounded-full shadow-lg flex items-center gap-3 font-medium">
        <div className="bg-white/20 rounded-full p-1">
          <Check size={16} className="text-white" />
        </div>
        {message}
      </div>
    </div>
  );
}
