import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalculatorMode, 
  ButtonType, 
  HistoryItem, 
  Theme,
  ProgrammerBase
} from './types';
import { 
  STANDARD_KEYS, 
  SCIENTIFIC_KEYS, 
  PROGRAMMER_KEYS 
} from './constants';
import { evaluateExpression, convertExpressionBase } from './utils/mathUtils';
import { Button } from './components/Button';
import { Display } from './components/Display';
import { HistoryPanel } from './components/HistoryPanel';
import { ProgrammerDisplay } from './components/ProgrammerDisplay';
import { Moon, Sun, Copy, Calculator, Binary, Sigma, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  // State
  const [mode, setMode] = useState<CalculatorMode>(CalculatorMode.STANDARD);
  const [programmerBase, setProgrammerBase] = useState<ProgrammerBase>(ProgrammerBase.DEC);
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<Theme>(Theme.LIGHT);
  const [showHistory, setShowHistory] = useState<boolean>(true);
  const [isDone, setIsDone] = useState<boolean>(false);
  
  // Effect State
  const [flash, setFlash] = useState<string | null>(null); 
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Theme and LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus-theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme(Theme.DARK);

    const savedHistory = localStorage.getItem('nexus-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nexus-history', JSON.stringify(history));
  }, [history]);

  const triggerFlash = (type: 'success' | 'error' | 'clear') => {
      setFlash(type);
      setTimeout(() => setFlash(null), 300);
  };

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2500);
  };

  const handleBaseChange = (newBase: ProgrammerBase) => {
      if (newBase === programmerBase) return;
      
      // Convert expression to new base format if possible
      // This allows the user to switch from DEC 10 -> BIN 1010
      // We only convert if there is an active expression
      if (expression && expression !== 'Error') {
          const converted = convertExpressionBase(expression, programmerBase, newBase);
          setExpression(converted);
          if (result && result !== 'Error') {
              // Re-evaluate to get result in new base string format
              // Note: evaluateExpression takes the *current* expression (which we just converted)
              // But setExpression is async. We should evaluate the *converted* string.
              const newRes = evaluateExpression(converted, 'PROGRAMMER', newBase);
              setResult(newRes);
          }
      }
      setProgrammerBase(newBase);
      setIsDone(true); // Treat conversion as a completed step so next typing replaces or appends appropriately
  };

  const handleButtonClick = useCallback((value: string, type: ButtonType) => {
    // ---- PROGRAMMER MODE GUARDS ----
    if (mode === CalculatorMode.PROGRAMMER) {
        // Guard 1: Bitwise operations only allowed in BIN
        const bitwiseOps = ['&', '|', 'xor', '~', '<<', '>>', 'xor']; // check labels or values
        // value for AND is ' & ', for XOR is ' xor ', etc.
        const isBitwiseInput = bitwiseOps.some(op => value.includes(op));

        if (isBitwiseInput && programmerBase !== ProgrammerBase.BIN) {
            showToast("Bitwise operations are available in Binary mode only");
            return;
        }

        // Guard 2: Digit validation per base
        if (type === ButtonType.NUMBER) {
             const valUpper = value.toUpperCase();
             // Allow 0-9 in DEC/HEX, but only 0-1 in BIN, 0-7 in OCT
             // Allow A-F only in HEX
             
             if (programmerBase === ProgrammerBase.BIN && !['0', '1'].includes(valUpper)) return;
             if (programmerBase === ProgrammerBase.OCT && !['0', '1', '2', '3', '4', '5', '6', '7'].includes(valUpper)) return;
             if (programmerBase === ProgrammerBase.DEC && !/[0-9]/.test(valUpper)) return;
             // HEX allows all (assuming keypad layout restricts others? Keypad has 0-9, A-F)
        }
    }

    if (type === ButtonType.ACTION) {
      switch (value) {
        case 'clear':
          setExpression('');
          setResult('');
          setIsDone(false);
          triggerFlash('clear');
          break;
        case 'backspace':
          setExpression((prev) => {
              if (prev === 'Error') return '';
              // Programmer mode specific: if we delete ' xor ', remove 5 chars? 
              // Simple slice for now, but improving backspace for spaced ops is good UX
              if (prev.endsWith(' xor ') || prev.endsWith(' mod ')) return prev.slice(0, -5);
              if (prev.endsWith(' << ') || prev.endsWith(' >> ')) return prev.slice(0, -4);
              if (prev.endsWith(' & ') || prev.endsWith(' | ')) return prev.slice(0, -3);
              return prev.slice(0, -1);
          });
          setIsDone(false);
          break;
        case '=':
          if (!expression) return;
          const calculated = evaluateExpression(expression, mode === CalculatorMode.PROGRAMMER ? 'PROGRAMMER' : 'STANDARD', programmerBase);
          if (calculated && calculated !== 'Error') {
            setResult(calculated);
            // In programmer mode, we usually keep the expression as is or update it?
            // Standard calc behavior: Result becomes new expression
            setExpression(calculated);
            
            const newHistoryItem: HistoryItem = {
              id: Date.now().toString(),
              expression: expression,
              result: calculated,
              timestamp: Date.now(),
            };
            setHistory((prev) => [newHistoryItem, ...prev].slice(0, 20));
            setIsDone(true);
            triggerFlash('success');
          } else {
            setResult('Error');
            triggerFlash('error');
            setIsDone(true);
          }
          break;
        case 'negate':
            if (expression && expression !== 'Error') {
                if (expression.startsWith('-')) setExpression(expression.slice(1));
                else setExpression('-' + expression);
                setIsDone(false);
            }
            break;
      }
    } else {
      // Auto-clear error
      if (expression === 'Error') {
          if (type === ButtonType.NUMBER) {
              setExpression(value);
              setIsDone(false);
              return;
          } else {
              setExpression('');
          }
      }

      // Handle NOT (~) operator
      if (value === '~') {
          if (isDone) {
              setExpression(`~${expression}`);
              setIsDone(false);
              return;
          }
          
          setExpression((prev) => {
              if (prev === '') return '~';
              if (/[+\-*/^&|(<>\s]$/.test(prev)) {
                  return prev + '~';
              }
              const match = prev.match(/(\d+|[A-F]+)$/);
              if (match) {
                  const lastNum = match[0];
                  const before = prev.slice(0, -lastNum.length);
                  return before + '~' + lastNum;
              }
              return prev + '~';
          });
          return;
      }

      if (isDone) {
          if (type === ButtonType.NUMBER) {
              setExpression(value);
              setIsDone(false);
              return;
          } else {
              setIsDone(false);
          }
      }

      setExpression((prev) => {
          const trimmedVal = value.trim();
          const invalidStarters = ['*', '/', ')', '^', '^2', '&', '|', '<<', '>>', 'mod', 'xor'];
          
          if ((prev === '' || prev.endsWith('(')) && invalidStarters.includes(trimmedVal)) {
              return prev;
          }
          return prev + value;
      });
    }
  }, [expression, isDone, mode, programmerBase]);

  // Live Preview
  useEffect(() => {
    if (expression && expression !== 'Error') {
        const liveCalc = evaluateExpression(expression, mode === CalculatorMode.PROGRAMMER ? 'PROGRAMMER' : 'STANDARD', programmerBase);
        if (liveCalc && liveCalc !== 'Error') {
            setResult(liveCalc);
        }
    } else if (!expression) {
        setResult('');
    }
  }, [expression, mode, programmerBase]);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (/[0-9]/.test(key)) handleButtonClick(key, ButtonType.NUMBER);
      
      // Hex keys
      if (mode === CalculatorMode.PROGRAMMER && /[a-fA-F]/.test(key)) {
          if (!e.ctrlKey && !e.metaKey && key.length === 1) {
             handleButtonClick(key.toUpperCase(), ButtonType.NUMBER);
          }
      }

      if (['+', '-', '*', '/', '(', ')', '.', '%'].includes(key)) {
          handleButtonClick(key, ButtonType.OPERATOR);
      }
      
      if (key === '^') {
          e.preventDefault();
          if (mode === CalculatorMode.PROGRAMMER) handleButtonClick(' xor ', ButtonType.OPERATOR); 
          else handleButtonClick('^', ButtonType.OPERATOR);
      }

      if (key === '&' || key === '|') {
          e.preventDefault();
          if (mode === CalculatorMode.PROGRAMMER) handleButtonClick(` ${key} `, ButtonType.OPERATOR);
      }
      
      if (key === '~') {
          e.preventDefault();
          if (mode === CalculatorMode.PROGRAMMER) handleButtonClick('~', ButtonType.OPERATOR);
      }

      if (key === 'Enter') { e.preventDefault(); handleButtonClick('=', ButtonType.ACTION); }
      if (key === 'Backspace') handleButtonClick('backspace', ButtonType.ACTION);
      if (key === 'Escape') handleButtonClick('clear', ButtonType.ACTION);
      
      if ((e.ctrlKey || e.metaKey) && key === 'c') {
          if (result || expression) {
              navigator.clipboard.writeText(result || expression);
              triggerFlash('success');
          }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonClick, expression, result, mode, programmerBase]);

  const getKeys = () => {
    switch (mode) {
      case CalculatorMode.SCIENTIFIC: return SCIENTIFIC_KEYS;
      case CalculatorMode.PROGRAMMER: return PROGRAMMER_KEYS;
      default: return STANDARD_KEYS;
    }
  };

  // Helper to determine if a button should be visually disabled
  const isButtonDisabled = (btn: any) => {
      if (mode !== CalculatorMode.PROGRAMMER) return false;
      
      // Disable bitwise if not BIN
      if (['AND', 'OR', 'XOR', 'NOT', '<<', '>>'].includes(btn.label)) {
          return programmerBase !== ProgrammerBase.BIN;
      }

      // Disable numbers not valid for base
      if (btn.type === ButtonType.NUMBER) {
          if (programmerBase === ProgrammerBase.BIN) return !['0', '1'].includes(btn.label);
          if (programmerBase === ProgrammerBase.OCT) return !['0', '1', '2', '3', '4', '5', '6', '7'].includes(btn.label);
          if (programmerBase === ProgrammerBase.DEC) return !/[0-9]/.test(btn.label); // A-F invalid
          if (programmerBase === ProgrammerBase.HEX) return false; // All valid
      }
      return false;
  };

  const getGridCols = () => {
     switch (mode) {
        case CalculatorMode.SCIENTIFIC: return 'grid-cols-5';
        case CalculatorMode.PROGRAMMER: return 'grid-cols-5';
        default: return 'grid-cols-4';
     }
  };

  const copyToClipboard = () => {
    const textToCopy = result || expression;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      triggerFlash('success');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-nexus-50 via-nexus-100 to-nexus-200 dark:from-dark-bg dark:via-slate-900 dark:to-nexus-950 transition-colors duration-500 overflow-hidden relative">
      
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-nexus-300/20 dark:bg-nexus-600/10 blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], rotate: [0, -60, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-300/20 dark:bg-purple-600/10 blur-[100px] pointer-events-none"
      />

      <AnimatePresence>
        {flash === 'success' && (
             <motion.div initial={{ opacity: 0.3, scale: 0.8 }} animate={{ opacity: 0, scale: 1.2 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-50 pointer-events-none bg-gradient-to-r from-green-400/20 to-nexus-400/20 mix-blend-overlay" />
        )}
        {flash === 'error' && (
             <motion.div initial={{ opacity: 0.3, x: -10 }} animate={{ opacity: 0, x: [10, -10, 5, -5, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-50 pointer-events-none bg-red-500/10" />
        )}
         {flash === 'clear' && (
             <motion.div initial={{ opacity: 0.4 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-50 pointer-events-none bg-white/30 dark:bg-white/10" />
        )}
        
        {/* Toast Notification */}
        {toastMessage && (
            <motion.div 
                initial={{ opacity: 0, y: -50 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-8 left-0 right-0 z-[100] flex justify-center pointer-events-none"
            >
                <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium backdrop-blur-md bg-opacity-90">
                    <AlertCircle size={16} />
                    {toastMessage}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row w-full max-w-5xl gap-6 relative z-10">
        <div className="flex-1 flex flex-col bg-white/80 dark:bg-dark-surface/80 glass rounded-3xl shadow-2xl shadow-nexus-500/10 dark:shadow-black/40 overflow-hidden border border-white/40 dark:border-white/5 transition-all duration-300 backdrop-blur-xl">
          
          <div className="flex justify-between items-center p-6 pb-2">
            <div className="flex items-center gap-2">
               <div className="flex gap-1.5 group cursor-default">
                <div className="w-3 h-3 rounded-full bg-red-400/80 shadow-inner group-hover:bg-red-500 transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400/80 shadow-inner group-hover:bg-yellow-500 transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-green-400/80 shadow-inner group-hover:bg-green-500 transition-colors"></div>
               </div>
               <span className="ml-4 font-semibold text-gray-700 dark:text-gray-200 text-lg tracking-tight select-none">Hi9! dev</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-slate-800/50 p-1 rounded-full backdrop-blur-sm">
               <motion.button 
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={() => setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT)}
                className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-700 transition-all text-gray-600 dark:text-gray-300"
               >
                 {theme === Theme.LIGHT ? <Sun size={18} /> : <Moon size={18} />}
               </motion.button>
            </div>
          </div>

          <div className="flex px-6 gap-2 mb-4 overflow-x-auto scrollbar-hide py-2">
             {[
               { m: CalculatorMode.STANDARD, icon: Calculator }, 
               { m: CalculatorMode.SCIENTIFIC, icon: Sigma }, 
               { m: CalculatorMode.PROGRAMMER, icon: Binary }
             ].map((item) => (
               <motion.button
                 key={item.m}
                 onClick={() => setMode(item.m)}
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap z-0 overflow-hidden ${
                   mode === item.m 
                   ? 'text-white shadow-lg shadow-nexus-500/30' 
                   : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                 }`}
               >
                 {mode === item.m && (
                   <motion.div layoutId="mode-pill" className="absolute inset-0 bg-nexus-600 z-[-1]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                 )}
                 <item.icon size={16} className="z-10 relative" />
                 <span className="z-10 relative">{item.m}</span>
               </motion.button>
             ))}
          </div>

          <div className="px-6 flex-1 flex flex-col">
            <div className="relative group perspective-[1000px]">
                <Display expression={expression} result={result} historyPreview="" />
                <motion.button 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-nexus-600 cursor-pointer shadow-sm backdrop-blur-sm z-20"
                    title="Copy to clipboard"
                >
                    <Copy size={16} />
                </motion.button>
            </div>

            <AnimatePresence>
                {mode === CalculatorMode.PROGRAMMER && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <ProgrammerDisplay 
                            currentValue={result || expression || '0'} 
                            activeBase={programmerBase}
                            onBaseChange={handleBaseChange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`grid ${getGridCols()} gap-3 pb-6 flex-1`}
                >
                    {getKeys().map((btn, index) => {
                        const disabled = isButtonDisabled(btn);
                        const btnCopy = disabled ? { ...btn, disabled: true, className: `${btn.className || ''} opacity-30` } : btn;
                        
                        return (
                            <Button key={`${mode}-${index}`} button={btnCopy} onClick={handleButtonClick} />
                        );
                    })}
                </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden lg:block">
            <HistoryPanel 
                history={history} 
                onSelect={(val) => {
                    setExpression(val);
                    setResult('');
                    setIsDone(false);
                }} 
                onClear={() => setHistory([])}
                isOpen={showHistory}
            />
        </div>
        
        <div className="lg:hidden">
            {history.length > 0 && (
                <div className="mt-4">
                     <h3 className="text-gray-500 dark:text-gray-400 font-bold mb-2">Recent History</h3>
                     <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-2">
                        {history.slice(0, 3).map(h => (
                            <div key={h.id} onClick={() => { setExpression(h.result); setResult(''); setIsDone(false); }} className="flex justify-between p-2 border-b border-gray-200 dark:border-slate-700 last:border-0 text-sm active:bg-gray-100 dark:active:bg-slate-700 transition-colors rounded">
                                <span className="text-gray-500">{h.expression} =</span>
                                <span className="font-bold dark:text-white">{h.result}</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>

      </motion.div>
    </div>
  );
};

export default App;