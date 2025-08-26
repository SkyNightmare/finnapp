import { useState, useEffect } from 'react';
import { Goal } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGoals = data.map(g => ({
        ...g,
        targetDate: new Date(g.target_date)
      }));

      setGoals(formattedGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGoal = async (goal: Omit<Goal, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          name: goal.name,
          target_amount: goal.targetAmount,
          current_amount: goal.currentAmount,
          target_date: goal.targetDate.toISOString(),
          category: goal.category,
          track_income: goal.trackIncome || false,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newGoal = {
        id: data.id,
        name: data.name,
        targetAmount: data.target_amount,
        currentAmount: data.current_amount,
        targetDate: new Date(data.target_date),
        category: data.category,
        trackIncome: data.track_income,
        userId: data.user_id
      };

      setGoals(prev => [newGoal, ...prev]);
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          current_amount: updates.currentAmount
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      ));
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    refetch: fetchGoals
  };
}