import React, { useEffect } from 'react';
import { WeeklyRoutine } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity, Flame, Target } from 'lucide-react';
import { getUserSettings, updateUserSettings } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface WeeklyStatsProps {
  routine: WeeklyRoutine | null;
}

export default function WeeklyStats({ routine }: WeeklyStatsProps) {
  const [calorieGoal, setCalorieGoal] = React.useState<number>(500);
  const [isLoading, setIsLoading] = React.useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        const settings = await getUserSettings(currentUser.uid);
        setCalorieGoal(settings.calorieGoal);
      } catch (error) {
        console.error('Error loading user settings:', error);
        toast.error('Failed to load your calorie goal');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [currentUser]);

  const handleGoalChange = async (newGoal: number) => {
    if (!currentUser) return;
    
    setCalorieGoal(newGoal);
    try {
      await updateUserSettings(currentUser.uid, { calorieGoal: newGoal });
    } catch (error) {
      console.error('Error saving calorie goal:', error);
      toast.error('Failed to save your calorie goal');
    }
  };

  const getExerciseStats = () => {
    if (!routine) return [];

    const stats = new Map<string, number>();
    Object.values(routine.routines).forEach(day => {
      day.exercises.forEach(exercise => {
        const current = stats.get(exercise.name) || 0;
        stats.set(exercise.name, current + exercise.calories);
      });
    });

    return Array.from(stats.entries()).map(([name, calories]) => ({
      name,
      calories,
    }));
  };

  const getTotalCalories = () => {
    if (!routine) return 0;
    return Object.values(routine.routines).reduce((total, day) => total + day.totalCalories, 0);
  };

  const data = getExerciseStats();
  const COLORS = ['#00fff5', '#ff00ff', '#7928ca', '#f72585', '#4cc9f0', '#7209b7', '#3a0ca3'];
  
  const totalCalories = getTotalCalories();
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);
  const remainingCalories = Math.max(calorieGoal - totalCalories, 0);

  if (isLoading) {
    return (
      <div className="cyber-card animate-pulse">
        <div className="h-4 bg-cyber-primary/20 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-32 bg-cyber-primary/20 rounded"></div>
          <div className="h-4 bg-cyber-primary/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card">
      <h2 className="text-xl font-bold text-cyber-primary mb-6">Weekly Statistics</h2>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-cyber-primary">Weekly Calorie Goal</label>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-cyber-secondary" />
            <input
              type="number"
              className="cyber-input w-24 text-right"
              value={calorieGoal}
              onChange={(e) => handleGoalChange(Math.max(0, Number(e.target.value)))}
              min="0"
              step="100"
            />
            <span className="text-sm text-cyber-light">kcal</span>
          </div>
        </div>

        <div className="relative pt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold inline-block text-cyber-primary">
              {progress.toFixed(1)}% Complete
            </span>
            <span className="text-xs font-semibold inline-block text-cyber-secondary">
              {remainingCalories.toFixed(0)} kcal remaining
            </span>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded-full bg-cyber-dark/50 border border-cyber-primary/30">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center cyber-gradient"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-cyber-secondary" />
          <span className="text-lg font-bold">{totalCalories.toFixed(0)} kcal</span>
        </div>
        <Activity className="w-5 h-5 text-cyber-primary" />
      </div>

      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="calories"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex justify-between items-center">
            <span className="text-sm" style={{ color: COLORS[index % COLORS.length] }}>
              {item.name}
            </span>
            <span className="font-bold">{item.calories.toFixed(0)} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );
}