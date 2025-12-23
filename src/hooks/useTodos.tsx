import { useState, useEffect, useCallback } from 'react';
import { supabase, Todo } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { addDays, addWeeks, addMonths } from 'date-fns';

export type FilterType = 'all' | 'completed' | 'pending' | 'overdue' | 'today' | 'upcoming';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTodos = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching todos',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      setTodos(data || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTodos]);

  const addTodo = async (title: string, description?: string) => {
    if (!user) return;

    // Optimistic update
    const tempId = crypto.randomUUID();
    const newTodo: Todo = {
      id: tempId,
      user_id: user.id,
      title,
      description: description || null,
      completed: false,
      due_date: null,
      is_recurring: false,
      recurrence_pattern: null,
      recurrence_interval: null,
      next_occurrence: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTodos(prev => [newTodo, ...prev]);

    const { error } = await supabase.from('todos').insert({
      user_id: user.id,
      title,
      description: description || null,
      completed: false
    });

    if (error) {
      // Rollback on error
      setTodos(prev => prev.filter(t => t.id !== tempId));
      toast({
        title: 'Error adding todo',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Todo added!' });
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const { error } = await supabase
      .from('todos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error updating todo',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const toggleComplete = async (todo: Todo) => {
    const newCompleted = !todo.completed;
    
    // Optimistic update
    setTodos(prev => prev.map(t => 
      t.id === todo.id ? { ...t, completed: newCompleted } : t
    ));
    
    const { error } = await supabase
      .from('todos')
      .update({ completed: newCompleted, updated_at: new Date().toISOString() })
      .eq('id', todo.id);

    if (error) {
      // Rollback on error
      setTodos(prev => prev.map(t => 
        t.id === todo.id ? { ...t, completed: !newCompleted } : t
      ));
      toast({
        title: 'Error updating todo',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    if (newCompleted && todo.is_recurring && todo.recurrence_pattern && todo.recurrence_interval) {
      const baseDate = todo.due_date ? new Date(todo.due_date) : new Date();
      let nextDate: Date;

      switch (todo.recurrence_pattern) {
        case 'daily':
          nextDate = addDays(baseDate, todo.recurrence_interval);
          break;
        case 'weekly':
          nextDate = addWeeks(baseDate, todo.recurrence_interval);
          break;
        case 'monthly':
          nextDate = addMonths(baseDate, todo.recurrence_interval);
          break;
        default:
          return;
      }

      await supabase.from('todos').insert({
        user_id: todo.user_id,
        title: todo.title,
        description: todo.description,
        completed: false,
        due_date: nextDate.toISOString(),
        is_recurring: true,
        recurrence_pattern: todo.recurrence_pattern,
        recurrence_interval: todo.recurrence_interval,
        next_occurrence: null
      });

      toast({ title: 'Next occurrence created!' });
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic update
    const deletedTodo = todos.find(t => t.id === id);
    setTodos(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      // Rollback on error
      if (deletedTodo) {
        setTodos(prev => [...prev, deletedTodo]);
      }
      toast({
        title: 'Error deleting todo',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Todo deleted' });
    }
  };

  const filteredTodos = todos.filter(todo => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDate = todo.due_date ? new Date(todo.due_date) : null;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!todo.title.toLowerCase().includes(query) && 
          !todo.description?.toLowerCase().includes(query)) {
        return false;
      }
    }

    switch (filter) {
      case 'completed':
        return todo.completed;
      case 'pending':
        return !todo.completed;
      case 'overdue':
        return !todo.completed && dueDate && dueDate < today;
      case 'today':
        return dueDate && 
          dueDate.getFullYear() === today.getFullYear() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getDate() === today.getDate();
      case 'upcoming':
        return !todo.completed && dueDate && dueDate > today;
      default:
        return true;
    }
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => {
      if (t.completed || !t.due_date) return false;
      return new Date(t.due_date) < new Date();
    }).length
  };

  return {
    todos: filteredTodos,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    addTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    stats,
    refetch: fetchTodos
  };
}
