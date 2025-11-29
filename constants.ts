import { ButtonType, CalculatorButton } from './types';

/*
  // Bitwise Truth Tables (32-bit)
  AND (&)       OR (|)        XOR (^)       NOT (~)
  0 & 0 = 0     0 | 0 = 0     0 ^ 0 = 0     ~0 = 1 (111...111) -> 4294967295 (Unsigned 32-bit)
  0 & 1 = 0     0 | 1 = 1     0 ^ 1 = 1     ~1 = 0 (000...000)
  1 & 0 = 0     1 | 0 = 1     1 ^ 0 = 1
  1 & 1 = 1     1 | 1 = 1     1 ^ 1 = 0

  Left Shift (<<)  → multiply by 2^n, fill right with 0s
  Right Shift (>>) → divide by 2^n (unsigned), fill left with 0s
*/

// Standard Layout
export const STANDARD_KEYS: CalculatorButton[] = [
  { label: 'C', value: 'clear', type: ButtonType.ACTION, className: 'text-red-500' },
  { label: '(', value: '(', type: ButtonType.OPERATOR },
  { label: ')', value: ')', type: ButtonType.OPERATOR },
  { label: '⌫', value: 'backspace', type: ButtonType.ACTION },
  
  { label: '1/x', value: '1/', type: ButtonType.OPERATOR },
  { label: 'x²', value: '^2', type: ButtonType.OPERATOR },
  { label: '√', value: 'sqrt(', type: ButtonType.FUNCTION },
  { label: '÷', value: '/', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  { label: '7', value: '7', type: ButtonType.NUMBER },
  { label: '8', value: '8', type: ButtonType.NUMBER },
  { label: '9', value: '9', type: ButtonType.NUMBER },
  { label: '×', value: '*', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  { label: '4', value: '4', type: ButtonType.NUMBER },
  { label: '5', value: '5', type: ButtonType.NUMBER },
  { label: '6', value: '6', type: ButtonType.NUMBER },
  { label: '-', value: '-', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  { label: '1', value: '1', type: ButtonType.NUMBER },
  { label: '2', value: '2', type: ButtonType.NUMBER },
  { label: '3', value: '3', type: ButtonType.NUMBER },
  { label: '+', value: '+', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  { label: '+/-', value: 'negate', type: ButtonType.ACTION },
  { label: '0', value: '0', type: ButtonType.NUMBER },
  { label: '.', value: '.', type: ButtonType.NUMBER },
  { label: '=', value: '=', type: ButtonType.ACTION, className: 'bg-nexus-600 text-white border-nexus-600 hover:bg-nexus-700' },
];

// Scientific Layout (Extends functionality)
export const SCIENTIFIC_KEYS: CalculatorButton[] = [
  // Row 1
  { label: '1/x', value: '1/', type: ButtonType.OPERATOR }, 
  { label: 'π', value: 'pi', type: ButtonType.NUMBER },
  { label: 'e', value: 'e', type: ButtonType.NUMBER },
  { label: 'C', value: 'clear', type: ButtonType.ACTION, className: 'text-red-500' },
  { label: '⌫', value: 'backspace', type: ButtonType.ACTION },

  // Row 2
  { label: 'sin', value: 'sin(', type: ButtonType.FUNCTION },
  { label: 'cos', value: 'cos(', type: ButtonType.FUNCTION },
  { label: 'tan', value: 'tan(', type: ButtonType.FUNCTION },
  { label: '(', value: '(', type: ButtonType.OPERATOR },
  { label: ')', value: ')', type: ButtonType.OPERATOR },

  // Row 3
  { label: 'xʸ', value: '^', type: ButtonType.OPERATOR },
  { label: 'log', value: 'log10(', type: ButtonType.FUNCTION },
  { label: 'ln', value: 'log(', type: ButtonType.FUNCTION },
  { label: 'eˣ', value: 'exp(', type: ButtonType.FUNCTION },
  { label: '÷', value: '/', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 4
  { label: '√', value: 'sqrt(', type: ButtonType.FUNCTION },
  { label: '7', value: '7', type: ButtonType.NUMBER },
  { label: '8', value: '8', type: ButtonType.NUMBER },
  { label: '9', value: '9', type: ButtonType.NUMBER },
  { label: '×', value: '*', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 5
  { label: 'x²', value: '^2', type: ButtonType.OPERATOR },
  { label: '4', value: '4', type: ButtonType.NUMBER },
  { label: '5', value: '5', type: ButtonType.NUMBER },
  { label: '6', value: '6', type: ButtonType.NUMBER },
  { label: '-', value: '-', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 6
  { label: '|x|', value: 'abs(', type: ButtonType.FUNCTION },
  { label: '1', value: '1', type: ButtonType.NUMBER },
  { label: '2', value: '2', type: ButtonType.NUMBER },
  { label: '3', value: '3', type: ButtonType.NUMBER },
  { label: '+', value: '+', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 7
  { label: 'mod', value: ' mod ', type: ButtonType.OPERATOR },
  { label: '+/-', value: 'negate', type: ButtonType.ACTION },
  { label: '0', value: '0', type: ButtonType.NUMBER },
  { label: '.', value: '.', type: ButtonType.NUMBER },
  { label: '=', value: '=', type: ButtonType.ACTION, className: 'bg-nexus-600 text-white border-nexus-600 hover:bg-nexus-700' },
];

// Programmer Layout
export const PROGRAMMER_KEYS: CalculatorButton[] = [
  // Row 1 - Bitwise (Bin Only)
  { label: 'AND', value: ' & ', type: ButtonType.OPERATOR, className: 'text-xs' },
  { label: 'OR', value: ' | ', type: ButtonType.OPERATOR, className: 'text-xs' },
  { label: 'XOR', value: ' xor ', type: ButtonType.OPERATOR, className: 'text-xs' }, 
  { label: 'NOT', value: '~', type: ButtonType.OPERATOR, className: 'text-xs' },
  { label: 'C', value: 'clear', type: ButtonType.ACTION, className: 'text-red-500' },
  
  // Row 2 - Bitwise Shift + Hex
  { label: '<<', value: ' << ', type: ButtonType.OPERATOR },
  { label: '>>', value: ' >> ', type: ButtonType.OPERATOR },
  { label: 'A', value: 'A', type: ButtonType.NUMBER },
  { label: 'B', value: 'B', type: ButtonType.NUMBER },
  { label: '⌫', value: 'backspace', type: ButtonType.ACTION },

  // Row 3
  { label: '(', value: '(', type: ButtonType.OPERATOR },
  { label: ')', value: ')', type: ButtonType.OPERATOR },
  { label: 'C', value: 'C', type: ButtonType.NUMBER },
  { label: 'D', value: 'D', type: ButtonType.NUMBER },
  { label: '÷', value: '/', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 4
  { label: '7', value: '7', type: ButtonType.NUMBER },
  { label: '8', value: '8', type: ButtonType.NUMBER },
  { label: '9', value: '9', type: ButtonType.NUMBER },
  { label: 'E', value: 'E', type: ButtonType.NUMBER },
  { label: '×', value: '*', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 5
  { label: '4', value: '4', type: ButtonType.NUMBER },
  { label: '5', value: '5', type: ButtonType.NUMBER },
  { label: '6', value: '6', type: ButtonType.NUMBER },
  { label: 'F', value: 'F', type: ButtonType.NUMBER },
  { label: '-', value: '-', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 6
  { label: '1', value: '1', type: ButtonType.NUMBER },
  { label: '2', value: '2', type: ButtonType.NUMBER },
  { label: '3', value: '3', type: ButtonType.NUMBER },
  { label: '00', value: '00', type: ButtonType.NUMBER },
  { label: '+', value: '+', type: ButtonType.OPERATOR, className: 'text-nexus-500' },

  // Row 7
  { label: '0', value: '0', type: ButtonType.NUMBER, className: 'col-span-2' },
  { label: '.', value: '.', type: ButtonType.NUMBER, disabled: true }, // Disabled in all bases for simplicity in programmer mode? Or allowed for decimal?
  { label: '=', value: '=', type: ButtonType.ACTION, className: 'col-span-2 bg-nexus-600 text-white border-nexus-600 hover:bg-nexus-700' },
];