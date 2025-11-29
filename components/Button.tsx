import React, { useState } from 'react';
import { ButtonType, CalculatorButton } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ButtonProps {
  button: CalculatorButton;
  onClick: (value: string, type: ButtonType) => void;
}

export const Button: React.FC<ButtonProps> = ({ button, onClick }) => {
  const isOperator = button.type === ButtonType.OPERATOR;
  const isAction = button.type === ButtonType.ACTION;
  const isFunction = button.type === ButtonType.FUNCTION;
  const [ripples, setRipples] = useState<{x: number, y: number, id: number}[]>([]);
  
  // Base classes
  let baseClasses = "relative overflow-hidden rounded-xl p-4 text-xl font-medium shadow-sm select-none outline-none focus:ring-2 focus:ring-nexus-400/50 dark:focus:ring-nexus-600/50 touch-manipulation transform-gpu";
  
  // Theme variants (Glassmorphism + Neomorphism touches)
  let colorClasses = "";
  let rippleColor = "rgba(255, 255, 255, 0.5)"; // Default white ripple
  
  if (isOperator || isFunction) {
    colorClasses = "bg-nexus-100 text-nexus-700 dark:bg-slate-700/50 dark:text-nexus-300 border border-nexus-200 dark:border-slate-600";
    rippleColor = "rgba(14, 165, 233, 0.3)"; // Nexus blue ripple
  } else if (isAction && button.label === '=') {
    colorClasses = "bg-nexus-600 text-white shadow-nexus-500/20";
    rippleColor = "rgba(255, 255, 255, 0.6)";
  } else if (isAction && (button.value === 'clear' || button.value === 'backspace')) {
    colorClasses = "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30";
    rippleColor = "rgba(239, 68, 68, 0.2)";
  } else {
    // Numbers
    colorClasses = "bg-white text-gray-700 dark:bg-slate-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700/50";
    rippleColor = "rgba(0, 0, 0, 0.1)"; // Dark ripple for light theme numbers
  }
  
  // Adjust ripple for dark mode numbers
  const isDark = document.documentElement.classList.contains('dark');
  if (isDark && !isOperator && !isAction && !isFunction) {
      rippleColor = "rgba(255, 255, 255, 0.1)";
  }

  const finalClass = `${baseClasses} ${colorClasses} ${button.className || ''} ${button.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (button.disabled) return;

    // Calculate ripple position relative to button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);
    
    // Trigger action
    onClick(button.value, button.type);

    // Remove ripple after animation
    setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, filter: 'brightness(1.05)' }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        opacity: { duration: 0.2 } 
      }}
      onClick={handleClick}
      className={finalClass}
      aria-label={button.label}
    >
      <span className="relative z-10 pointer-events-none">{button.label}</span>
      
      {/* Ripple Container */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: ripple.y,
              left: ripple.x,
              width: 80,
              height: 80,
              marginLeft: -40,
              marginTop: -40,
              borderRadius: '50%',
              backgroundColor: rippleColor,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        ))}
      </AnimatePresence>

      {/* Subtle shine effect on hover */}
      <motion.div 
        className="absolute inset-0 bg-white/20 dark:bg-white/5 pointer-events-none z-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  );
};