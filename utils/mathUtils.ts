import { create, all } from 'mathjs';
import { ProgrammerBase } from '../types';

// Default instance for Standard/Scientific (High Precision)
const math = create(all, {
  number: 'BigNumber', 
  precision: 64,
});

// Integer/Bitwise instance (Standard JS numbers for 32-bit int behavior)
const mathInt = create(all, {
  number: 'number',
});

// Helper: Convert string expression numbers from one base to another
export const convertExpressionBase = (expression: string, fromBase: ProgrammerBase, toBase: ProgrammerBase): string => {
    if (!expression || expression === 'Error') return '';

    // Regex to find numbers. Note: Hex can contain A-F, so we need careful parsing.
    // We assume the expression is space-delimited or operators are distinct.
    // Simple parser: Split by operators and non-alphanumeric chars
    // This is tricky for things like "A+B".
    // Strategy: Use a regex that identifies tokens.
    
    // Pattern to match hex/dec/oct/bin numbers
    const tokenRegex = /([0-9A-Fa-f]+)|([\+\-\*\/\(\)\s\^\|\&~]|<<|>>|mod|xor)/g;
    
    let result = '';
    let match;
    
    while ((match = tokenRegex.exec(expression)) !== null) {
        const token = match[0];
        
        // If it's an operator or whitespace, keep it
        if (/^[\+\-\*\/\(\)\s\^\|\&~]|<<|>>|mod|xor$/.test(token)) {
            result += token;
            continue;
        }

        // It's a number candidate. Validate based on fromBase.
        let isValidNumber = false;
        let numVal = 0;

        try {
            if (fromBase === ProgrammerBase.HEX && /^[0-9A-Fa-f]+$/.test(token)) {
                 numVal = parseInt(token, 16);
                 isValidNumber = !isNaN(numVal);
            } else if (fromBase === ProgrammerBase.DEC && /^[0-9]+$/.test(token)) {
                 numVal = parseInt(token, 10);
                 isValidNumber = !isNaN(numVal);
            } else if (fromBase === ProgrammerBase.OCT && /^[0-7]+$/.test(token)) {
                 numVal = parseInt(token, 8);
                 isValidNumber = !isNaN(numVal);
            } else if (fromBase === ProgrammerBase.BIN && /^[0-1]+$/.test(token)) {
                 numVal = parseInt(token, 2);
                 isValidNumber = !isNaN(numVal);
            }

            if (isValidNumber) {
                // Convert to toBase
                if (toBase === ProgrammerBase.HEX) result += numVal.toString(16).toUpperCase();
                else if (toBase === ProgrammerBase.DEC) result += numVal.toString(10);
                else if (toBase === ProgrammerBase.OCT) result += numVal.toString(8);
                else if (toBase === ProgrammerBase.BIN) result += numVal.toString(2);
            } else {
                // If parsing failed (e.g. "A" in Decimal mode isn't a number), just keep token
                result += token;
            }
        } catch (e) {
            result += token;
        }
    }
    return result;
};

export const evaluateExpression = (expression: string, mode: 'STANDARD' | 'SCIENTIFIC' | 'PROGRAMMER' = 'STANDARD', programmerBase: ProgrammerBase = ProgrammerBase.DEC): string => {
  try {
    let sanitized = expression;

    // 1. Basic cleanup
    sanitized = sanitized.replace(/×/g, '*').replace(/÷/g, '/');
    sanitized = sanitized.replace(/π/g, 'pi');
    
    // 2. Bitwise/Programmer operator replacements
    sanitized = sanitized.replace(/\bxor\b/g, '^|'); // Bitwise XOR
    sanitized = sanitized.replace(/\bmod\b/g, '%');

    if (!sanitized.trim()) return '';

    // 3. Auto-close parentheses
    const openParens = (sanitized.match(/\(/g) || []).length;
    const closeParens = (sanitized.match(/\)/g) || []).length;
    if (openParens > closeParens) {
        sanitized += ')'.repeat(openParens - closeParens);
    }

    // 4. Mode Specific Parsing
    let result;

    if (mode === 'PROGRAMMER') {
        // Pre-process numbers based on Base
        // We need to wrap numbers in 0x, 0b, 0o for MathJS evaluation
        // Regex to identify potential number tokens
        const tokenRegex = /\b([0-9A-Fa-f]+)\b/g;
        
        sanitized = sanitized.replace(tokenRegex, (match) => {
            // Check if it's strictly a number in the current base
            // (Avoid replacing function names like "sin" if we supported them, but programmer mode has limited functions)
            // However, "A" is a valid hex, but "A" is also a variable.
            // Since we don't have variables, we treat matching patterns as numbers.
            
            if (programmerBase === ProgrammerBase.HEX) return `0x${match}`;
            if (programmerBase === ProgrammerBase.OCT) return `0o${match}`;
            if (programmerBase === ProgrammerBase.BIN) return `0b${match}`;
            return match; // DEC, leave as is
        });

        // Use integer math
        result = mathInt.evaluate(sanitized);

        // Enforce 32-bit Unsigned Integer
        // MathJS 'number' config uses standard JS floats (64-bit).
        // Bitwise ops in JS return signed 32-bit integers.
        // We want unsigned 32-bit integers.
        if (typeof result === 'number') {
            result = result >>> 0; // Force unsigned 32-bit
        }
    } else {
        // Standard/Scientific
        const isBitwise = /[&|^~]|<<|>>/.test(sanitized);
        if (isBitwise) {
             result = mathInt.evaluate(sanitized);
             if (typeof result === 'number') result = Math.trunc(result);
        } else {
             result = math.evaluate(sanitized);
        }
    }

    if (result === undefined || result === null) return '';
    
    if (typeof result === 'boolean') {
        return result ? '1' : '0';
    }

    // Format Result based on Mode/Base
    if (mode === 'PROGRAMMER') {
        const num = Number(result);
        if (isNaN(num) || !isFinite(num)) return 'Error';
        
        // Return string in current base
        if (programmerBase === ProgrammerBase.HEX) return (num >>> 0).toString(16).toUpperCase();
        if (programmerBase === ProgrammerBase.OCT) return (num >>> 0).toString(8);
        if (programmerBase === ProgrammerBase.BIN) return (num >>> 0).toString(2);
        return (num >>> 0).toString(10);
    }

    // Standard Formatting
    let formatted = math.format(result, { precision: 14 });
    if (formatted === 'Infinity' || formatted === '-Infinity' || formatted === 'NaN') {
        return 'Error';
    }
    if (formatted.includes('.')) {
        formatted = formatted.replace(/\.?0+$/, "");
    }

    return formatted;
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
        if (!error.message?.includes('Value expected')) {
             console.error("Math evaluation error:", error.message);
        }
    }
    return 'Error';
  }
};

export const formatProgrammerValues = (currentValue: string, base: ProgrammerBase = ProgrammerBase.DEC) => {
  try {
    if (!currentValue || currentValue === 'Error') {
        return { dec: '0', hex: '0', oct: '0', bin: '0' };
    }

    let num: number;

    // Check if currentValue is an expression or a single number in the current base
    // We try to parse it as a single number of the current base first
    let parsed = false;
    
    if (base === ProgrammerBase.HEX) num = parseInt(currentValue, 16);
    else if (base === ProgrammerBase.OCT) num = parseInt(currentValue, 8);
    else if (base === ProgrammerBase.BIN) num = parseInt(currentValue, 2);
    else num = Number(currentValue);

    if (!isNaN(num) && isFinite(num)) {
        parsed = true;
    } else {
        // Fallback: evaluate as expression
        // Note: This relies on evaluateExpression logic, but we need to pass the base
        const res = evaluateExpression(currentValue, 'PROGRAMMER', base);
        if (res && res !== 'Error') {
             // result is a string in the current base
             if (base === ProgrammerBase.HEX) num = parseInt(res, 16);
             else if (base === ProgrammerBase.OCT) num = parseInt(res, 8);
             else if (base === ProgrammerBase.BIN) num = parseInt(res, 2);
             else num = Number(res);
        } else {
            num = 0;
        }
    }
    
    if (!isFinite(num) || isNaN(num)) {
        return { dec: '0', hex: '0', oct: '0', bin: '0' };
    }

    // Enforce 32-bit unsigned
    const unsigned = num >>> 0;

    return {
      dec: unsigned.toString(10),
      hex: unsigned.toString(16).toUpperCase(),
      oct: unsigned.toString(8),
      bin: unsigned.toString(2),
    };
  } catch (e) {
    return { dec: '0', hex: '0', oct: '0', bin: '0' };
  }
};