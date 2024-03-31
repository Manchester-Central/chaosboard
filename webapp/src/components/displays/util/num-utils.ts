export const clampNumber = (num: number, minValue: number, maxValue: number) => Math.max(Math.min(num, Math.max(minValue, maxValue)), Math.min(minValue, maxValue));
