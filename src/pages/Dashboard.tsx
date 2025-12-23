import { useAuth } from '@/hooks/useAuth';
import { useTodos } from '@/hooks/useTodos';
import Header from '@/components/todo/Header';
import TodoAddDialog from '@/components/todo/TodoAddDialog';
import TodoFilters from '@/components/todo/TodoFilters';
import TodoList from '@/components/todo/TodoList';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const {
    todos,
    loading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    addTodo,
    updateTodo,
    toggleComplete,
    deleteTodo,
    stats
  } = useTodos();

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        <Header user={user} stats={stats} onSignOut={signOut} />

        <div className="mt-8 space-y-6">
          <TodoAddDialog onAdd={addTodo} />

          <TodoFilters
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            stats={stats}
          />

          {loading && todos.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <TodoList
              todos={todos}
              onToggle={toggleComplete}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
