export enum CalculatorMode {
  STANDARD = 'Standard',
  SCIENTIFIC = 'Scientific',
  PROGRAMMER = 'Programmer',
}

export enum ProgrammerBase {
  DEC = 'DEC',
  HEX = 'HEX',
  OCT = 'OCT',
  BIN = 'BIN',
}

export enum ButtonType {
  NUMBER = 'number',
  OPERATOR = 'operator',
  ACTION = 'action',
  FUNCTION = 'function', // sin, cos, etc.
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export interface CalculatorButton {
  label: string;
  value: string;
  type: ButtonType;
  className?: string; // For specific styling (e.g., span 2 cols)
  disabled?: boolean;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}