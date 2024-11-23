import React from 'react';
import { WeeklyRoutine } from '../types';
import { Activity, ChevronRight } from 'lucide-react';

interface WeeklyViewProps {
  routine: WeeklyRoutine | null;
  onDaySelect: (day: string) => void;
}

export default function WeeklyView({ routine, onDaySelect }: WeeklyViewProps) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const getTotalCalories = () => {
    if (!routine) return 0;
    return Object.values(routine.routines).reduce((total, day) => total + day.totalCalories, 0);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'low':
        return 'text-blue-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <div className="cyber-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyber-primary">Weekly Overview</h2>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyber-secondary" />
          <span className="text-cyber-secondary font-bold">
            {getTotalCalories().toFixed(0)} kcal/week
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {days.map((day) => {
          const dayRoutine = routine?.routines[day.toLowerCase()];
          return (
            <div
              key={day}
              onClick={() => onDaySelect(day.toLowerCase())}
              className="p-4 border-2 border-cyber-primary/30 rounded-lg hover:border-cyber-primary hover:shadow-neon transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-cyber-primary">{day}</h3>
                {dayRoutine && (
                  <ChevronRight className="w-4 h-4 text-cyber-primary/50" />
                )}
              </div>
              {dayRoutine ? (
                <>
                  <div className="space-y-1">
                    {dayRoutine.exercises.map((ex, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-cyber-light/70">
                          {ex.name} - {ex.duration}min
                        </span>
                        <span className={`${getIntensityColor(ex.intensity)} capitalize`}>
                          {ex.intensity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-cyber-secondary font-bold">
                    {dayRoutine.totalCalories.toFixed(0)} kcal
                  </p>
                </>
              ) : (
                <p className="text-sm text-cyber-light/50">No exercises planned</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}