import React from 'react';

export default function ConfirmDialog({
  isOpen,
  icon: Icon,
  iconBgColor,
  title,
  message,
  confirmText,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Light overlay */}
      <div 
        className="absolute inset-0 bg-white/30 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Dialog Card */}
      <div className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center transform scale-100 opacity-100 animate-in zoom-in-95 duration-200">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${iconBgColor}`}>
          {Icon && <Icon size={32} />}
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-rose-500 font-medium mb-8">{message}</p>
        
        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 px-4 bg-rose-400 hover:bg-rose-500 text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
