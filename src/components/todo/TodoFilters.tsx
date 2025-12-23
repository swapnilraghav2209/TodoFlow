import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ListTodo, CheckCircle2, Circle, AlertTriangle, Calendar, CalendarClock } from 'lucide-react';
import { FilterType } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';

type TodoFiltersProps = {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
};

const filters: { value: FilterType; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: ListTodo },
  { value: 'pending', label: 'Pending', icon: Circle },
  { value: 'completed', label: 'Done', icon: CheckCircle2 },
  { value: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { value: 'today', label: 'Today', icon: Calendar },
  { value: 'upcoming', label: 'Upcoming', icon: CalendarClock },
];

export default function TodoFilters({ filter, onFilterChange, searchQuery, onSearchChange, stats }: TodoFiltersProps) {
  const getCount = (filterType: FilterType) => {
    switch (filterType) {
      case 'all': return stats.total;
      case 'completed': return stats.completed;
      case 'pending': return stats.pending;
      case 'overdue': return stats.overdue;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search todos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-card/50 border-border focus:border-primary glass"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map(({ value, label, icon: Icon }) => {
          const count = getCount(value);
          const isActive = filter === value;
          
          return (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange(value)}
              className={cn(
                "h-9 px-3 rounded-full transition-all",
                isActive 
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground glow-sm"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {label}
              {count !== null && (
                <span className={cn(
                  "ml-1.5 text-xs",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
