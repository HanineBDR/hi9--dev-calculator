import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (expression: string) => void;
  onClear: () => void;
  isOpen: boolean;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, isOpen }) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full lg:w-72 flex-shrink-0 flex flex-col bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700 lg:ml-4 h-64 lg:h-auto mt-4 lg:mt-0 shadow-lg dark:shadow-black/20"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <Clock size={18} />
          <span className="font-medium">History</span>
        </div>
        <button 
          onClick={onClear}
          className="p-1.5 rounded-full hover:bg-red-100 text-red-500 dark:hover:bg-red-900/30 transition-colors"
          title="Clear History"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 overflow-x-hidden">
        <AnimatePresence initial={false} mode='popLayout'>
          {history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-gray-400 text-sm"
            >
              <p>No history yet</p>
            </motion.div>
          ) : (
            history.map((item) => (
              <motion.button
                layout
                key={item.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.02, x: 5 }}
                onClick={() => onSelect(item.result)}
                className="w-full text-right p-3 rounded-lg hover:bg-nexus-50 dark:hover:bg-slate-700/50 transition-colors group flex flex-col items-end border border-transparent hover:border-nexus-100 dark:hover:border-slate-600 shadow-sm"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1 line-clamp-1 break-all">
                  {item.expression} =
                </span>
                <span className="text-lg font-medium text-gray-800 dark:text-white group-hover:text-nexus-600 dark:group-hover:text-nexus-400">
                  {item.result}
                </span>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};