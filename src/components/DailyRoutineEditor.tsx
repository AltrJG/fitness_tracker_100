import React, { useState, useEffect } from 'react';
import { Exercise, WeeklyRoutine } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { exercisesList, calculateCalories, intensityFactors } from '../data/exercises';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DailyRoutineEditorProps {
  userId: string;
  weeklyRoutine: WeeklyRoutine | null;
  selectedDay: string;
  onRoutineUpdate: (routine: WeeklyRoutine) => void;
}

export default function DailyRoutineEditor({ userId, weeklyRoutine, selectedDay, onRoutineUpdate }: DailyRoutineEditorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [weight, setWeight] = useState<number>(70);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (selectedDay && weeklyRoutine?.routines[selectedDay]) {
      const dayRoutine = weeklyRoutine.routines[selectedDay];
      // Ensure all exercises have an intensity value
      const updatedExercises = dayRoutine.exercises.map(ex => ({
        ...ex,
        intensity: ex.intensity || 'moderate'
      }));
      setExercises(updatedExercises);
      if (updatedExercises[0]?.weight) {
        setWeight(updatedExercises[0].weight);
      }
    } else {
      setExercises([]);
    }
  }, [selectedDay, weeklyRoutine]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exercisesList[0].name,
      met: exercisesList[0].met,
      duration: 30,
      weight,
      intensity: 'moderate',
      calories: calculateCalories(weight, exercisesList[0].met, 30, 'moderate')
    };
    setExercises([...exercises, newExercise]);
    setIsEditing(true);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === id) {
        const updated = { ...ex, [field]: value };
        if (field === 'name') {
          const exercise = exercisesList.find(e => e.name === value);
          if (exercise) {
            updated.met = exercise.met;
          }
        }
        updated.calories = calculateCalories(
          updated.weight,
          updated.met,
          updated.duration,
          updated.intensity
        );
        return updated;
      }
      return ex;
    }));
    setIsEditing(true);
  };

  const updateWeight = (newWeight: number) => {
    setWeight(newWeight);
    setExercises(exercises.map(ex => ({
      ...ex,
      weight: newWeight,
      calories: calculateCalories(newWeight, ex.met, ex.duration, ex.intensity)
    })));
    setIsEditing(true);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    setIsEditing(true);
  };

  const saveRoutine = async () => {
    if (!selectedDay) {
      toast.error('Please select a day');
      return;
    }

    try {
      const weekStart = new Date();
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const routineId = weeklyRoutine?.id || `${userId}-${weekStart.getTime()}`;
      const routineRef = doc(db, 'weeklyRoutines', routineId);

      const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
      const updatedRoutines = {
        ...(weeklyRoutine?.routines || {}),
        [selectedDay]: {
          id: `${routineId}-${selectedDay}`,
          date: new Date().toISOString(),
          exercises,
          totalCalories
        }
      };

      const updatedWeek = {
        id: routineId,
        userId,
        startDate: weekStart.toISOString(),
        routines: updatedRoutines
      };

      if (weeklyRoutine) {
        await updateDoc(routineRef, {
          routines: updatedRoutines
        });
      } else {
        await setDoc(routineRef, updatedWeek);
      }

      onRoutineUpdate(updatedWeek);
      setIsEditing(false);
      toast.success('Routine saved successfully');
    } catch (error) {
      console.error('Error saving routine:', error);
      toast.error('Failed to save routine');
    }
  };

  return (
    <div className="cyber-card">
      <h2 className="text-xl font-bold text-cyber-primary mb-6">Daily Routine Editor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-cyber-primary mb-2">Selected Day</label>
          <div className="cyber-input px-4 py-2">
            {selectedDay ? (
              <span className="text-cyber-primary capitalize">{selectedDay}</span>
            ) : (
              <span className="text-cyber-light/50">Select a day from the overview</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-cyber-primary mb-2">Your Weight (kg)</label>
          <input
            type="number"
            className="cyber-input w-full"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => updateWeight(Number(e.target.value))}
          />
        </div>
      </div>

      {selectedDay && (
        <div className="space-y-4 mb-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-2 border-cyber-primary/30 rounded-lg hover:border-cyber-primary transition-all duration-300">
              <div>
                <label className="block text-sm font-medium text-cyber-primary mb-2">Exercise Type</label>
                <select
                  className="cyber-input w-full"
                  value={exercise.name}
                  onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                >
                  {exercisesList.map(ex => (
                    <option key={ex.name} value={ex.name}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cyber-primary mb-2">Duration (min)</label>
                <input
                  type="number"
                  className="cyber-input w-full"
                  placeholder="Duration"
                  value={exercise.duration}
                  onChange={(e) => updateExercise(exercise.id, 'duration', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cyber-primary mb-2">Intensity</label>
                <select
                  className="cyber-input w-full"
                  value={exercise.intensity}
                  onChange={(e) => updateExercise(exercise.id, 'intensity', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-cyber-secondary font-bold">{exercise.calories.toFixed(0)} kcal</span>
                <span className="text-cyber-light/50 text-sm">
                  MET: {(exercise.met * intensityFactors[exercise.intensity]).toFixed(1)}
                </span>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="cyber-button w-full bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {exercises.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed border-cyber-primary/30 rounded-lg">
              <p className="text-cyber-light/50">No exercises added for {selectedDay}</p>
              <button onClick={addExercise} className="cyber-button mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add First Exercise
              </button>
            </div>
          )}
        </div>
      )}

      {selectedDay && (
        <div className="flex justify-between">
          {exercises.length > 0 && (
            <button onClick={addExercise} className="cyber-button flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          )}

          {isEditing && (
            <button 
              onClick={saveRoutine} 
              className="cyber-button flex items-center gap-2 bg-cyber-primary/10 hover:bg-cyber-primary/20"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>
      )}
    </div>
  );
}