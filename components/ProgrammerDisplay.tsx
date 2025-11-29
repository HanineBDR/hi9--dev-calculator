import React from 'react';
import { formatProgrammerValues } from '../utils/mathUtils';
import { ProgrammerBase } from '../types';
import { motion } from 'framer-motion';

interface ProgrammerDisplayProps {
  currentValue: string;
  activeBase: ProgrammerBase;
  onBaseChange: (base: ProgrammerBase) => void;
}

export const ProgrammerDisplay: React.FC<ProgrammerDisplayProps> = ({ currentValue, activeBase, onBaseChange }) => {
  const values = formatProgrammerValues(currentValue, activeBase);

  const Row = ({ label, value, base }: { label: string, value: string, base: ProgrammerBase }) => {
    const isActive = activeBase === base;
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onBaseChange(base)}
            className={`w-full flex justify-between items-center text-xs md:text-sm font-mono py-1.5 px-2 border-l-4 transition-all duration-200 ${
                isActive 
                ? 'bg-white dark:bg-slate-700 border-nexus-500 shadow-sm' 
                : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-500 dark:text-gray-500'
            }`}
        >
            <span className={`font-bold w-8 text-left ${isActive ? 'text-nexus-600 dark:text-nexus-400' : ''}`}>{label}</span>
            <span className={`truncate pl-2 ${isActive ? 'text-gray-900 dark:text-white font-medium' : ''}`}>{value}</span>
        </motion.button>
    );
  };

  return (
    <div className="w-full mb-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 overflow-hidden">
      <Row label="HEX" value={values.hex} base={ProgrammerBase.HEX} />
      <Row label="DEC" value={values.dec} base={ProgrammerBase.DEC} />
      <Row label="OCT" value={values.oct} base={ProgrammerBase.OCT} />
      <Row label="BIN" value={values.bin} base={ProgrammerBase.BIN} />
    </div>
  );
};