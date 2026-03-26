import { describe, it, expect } from 'vitest';
import { cn, truncate, formatDate } from './utils';

describe('cn', () => {
  it('merges classes', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional false values', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('deduplicates tailwind conflicts (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates long strings with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });

  it('does not truncate at exact limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('handles empty string', () => {
    expect(truncate('', 5)).toBe('');
  });
});

describe('formatDate', () => {
  it('formats a date string and includes day and year', () => {
    const result = formatDate('2025-01-15T00:00:00Z');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it('formats a Date object', () => {
    const result = formatDate(new Date(2025, 0, 15)); // Jan 15, 2025
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it('includes the month abbreviation', () => {
    const result = formatDate('2025-06-20T00:00:00Z');
    expect(result).toMatch(/Jun/);
  });
});
