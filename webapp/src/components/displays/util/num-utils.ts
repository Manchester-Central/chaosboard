export const clampNumber = (num: number, minValue: number, maxValue: number) => Math.max(Math.min(num, Math.max(minValue, maxValue)), Math.min(minValue, maxValue));

export const withSigFigs = (num: number, sigFigs: number) => Intl.NumberFormat('en-US', {maximumSignificantDigits: clampNumber(sigFigs, 1, 21)}).format(num)
