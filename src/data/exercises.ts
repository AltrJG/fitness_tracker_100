export const exercisesList = [
  { name: 'Running', met: 8.3 },
  { name: 'Cycling', met: 7.5 },
  { name: 'Swimming', met: 6.0 },
  { name: 'Weight Training', met: 5.0 },
  { name: 'HIIT', met: 8.0 },
  { name: 'Yoga', met: 3.0 },
  { name: 'Boxing', met: 7.8 },
  { name: 'Jump Rope', met: 10.0 },
  { name: 'Walking', met: 3.5 },
  { name: 'Pilates', met: 3.8 }
];

export const intensityFactors = {
  low: 0.75,
  moderate: 1,
  high: 1.25
};

export const calculateCalories = (weight: number, met: number, duration: number, intensity: 'low' | 'moderate' | 'high'): number => {
  const adjustedMet = met * intensityFactors[intensity];
  return (adjustedMet * 3.5 * weight * duration) / 200;
};