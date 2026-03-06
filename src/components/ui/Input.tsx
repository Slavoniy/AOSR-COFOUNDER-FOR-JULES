import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{label}</label>}
      <input
        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{label}</label>}
      <textarea
        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y min-h-[100px] ${className}`}
        {...props}
      />
    </div>
  );
};
