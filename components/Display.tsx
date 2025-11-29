import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisplayProps {
  expression: string;
  result: string;
  historyPreview: string; 
}

export const Display: React.FC<DisplayProps> = ({ expression, result, historyPreview }) => {
  const inputRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right when typing
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [expression, result]);

  return (
    <div className="flex flex-col items-end justify-end w-full p-6 mb-4 rounded-2xl bg-white/50 dark:bg-dark-display/50 glass border-b border-gray-200/50 dark:border-gray-700/50 min-h-[160px] relative overflow-hidden transition-colors duration-300">
      
      {/* Decorative gradient blob inside display */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-white/10 dark:to-black/20 pointer-events-none" />

      {/* History Preview */}
      <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 h-6 overflow-hidden text-ellipsis whitespace-nowrap w-full text-right z-10 transition-colors duration-300">
        {historyPreview}
      </div>

      {/* Main Expression Input */}
      <div 
        ref={inputRef}
        className="w-full text-right overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide text-3xl md:text-4xl font-light tracking-wide mb-2 z-10"
        style={{ scrollbarWidth: 'none' }}
      >
        <AnimatePresence mode='popLayout'>
            <motion.div
                key={expression} // Triggers animation on every change
                initial={{ scale: 1, x: 2 }}
                animate={{ scale: 1, x: 0 }}
                className="inline-block text-gray-800 dark:text-white transition-colors duration-300"
            >
                {/* Subtle pulse on text when typing */}
                <motion.span
                    key={expression.length} // New key for every char change to trigger impact
                    initial={{ display: "inline-block", scale: 1.1, filter: "brightness(1.5)" }}
                    animate={{ scale: 1, filter: "brightness(1)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                    {expression || '0'}
                </motion.span>
            </motion.div>
        </AnimatePresence>
      </div>

      {/* Live Result Preview */}
      <div className="h-8 w-full text-right overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
            {result && result !== expression && (
                <motion.div
                    key={result}
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-gray-400 dark:text-gray-500 text-xl md:text-2xl font-medium truncate"
                >
                    = {result}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};