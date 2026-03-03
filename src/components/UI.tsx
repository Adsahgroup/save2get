import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'px-6 py-4 rounded-none font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 select-none';
  
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200/50',
    secondary: 'gradient-brand text-white shadow-xl shadow-orange-500/30 hover:brightness-110',
    outline: 'bg-white border-2 border-slate-100 text-slate-900 hover:border-primary-green/30 hover:bg-slate-50 shadow-sm',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-[11px] font-black text-slate-400 ml-1 tracking-widest uppercase">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-green transition-colors">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-slate-50/50 border-2 border-slate-100/80 rounded-none px-5 py-4 outline-none focus:border-primary-green/40 focus:bg-white focus:shadow-xl focus:shadow-green-500/5 transition-all shadow-sm shadow-slate-200/20 placeholder:text-slate-300 font-medium ${icon ? 'pl-12' : ''} ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-none p-6 shadow-2xl shadow-slate-200/60 border border-slate-100/50 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-3xl hover:shadow-slate-300/40 hover:-translate-y-1 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);
