import { useState } from 'react';
import { Todo } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Repeat, 
  Paperclip, 
  Edit2, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { cn } from '@/lib/utils';
import TodoDetailModal from './TodoDetailModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type TodoItemProps = {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onDelete: (id: string) => void;
};

export default function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const dueDate = todo.due_date ? new Date(todo.due_date) : null;
  const isOverdue = dueDate && !todo.completed && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const isDueTomorrow = dueDate && isTomorrow(dueDate);

  const getDueDateDisplay = () => {
    if (!dueDate) return null;
    
    if (isToday(dueDate)) return 'Today';
    if (isTomorrow(dueDate)) return 'Tomorrow';
    if (isPast(dueDate)) return `Overdue by ${formatDistanceToNow(dueDate)}`;
    return format(dueDate, 'MMM d');
  };

  const dueDateClass = cn(
    "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
    isOverdue && "bg-destructive/20 text-destructive",
    isDueToday && !todo.completed && "bg-warning/20 text-warning",
    isDueTomorrow && !todo.completed && "bg-primary/20 text-primary",
    !isOverdue && !isDueToday && !isDueTomorrow && "bg-muted text-muted-foreground",
    todo.completed && "opacity-50"
  );

  return (
    <>
      <div 
        className={cn(
          "glass rounded-xl transition-all duration-200 animate-fade-in group",
          todo.completed && "opacity-70",
          isOverdue && !todo.completed && "animate-pulse-glow"
        )}
      >
        <div className="p-4 flex items-start gap-4">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo)}
            className={cn(
              "mt-1 h-5 w-5 rounded-full border-2 transition-all",
              todo.completed 
                ? "border-primary bg-primary data-[state=checked]:bg-primary checkbox-animate" 
                : "border-muted-foreground hover:border-primary"
            )}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 
                  className={cn(
                    "font-medium text-foreground transition-all cursor-pointer hover:text-primary",
                    todo.completed && "line-through text-muted-foreground"
                  )}
                  onClick={() => setShowModal(true)}
                >
                  {todo.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {dueDate && (
                    <span className={dueDateClass}>
                      <Calendar className="w-3 h-3" />
                      {getDueDateDisplay()}
                    </span>
                  )}
                  
                  {todo.is_recurring && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary flex items-center gap-1">
                      <Repeat className="w-3 h-3" />
                      {todo.recurrence_pattern}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setShowModal(true)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete todo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{todo.title}" and all its attachments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(todo.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {todo.description && (
              <div className="mt-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {isExpanded ? 'Hide' : 'Show'} details
                </button>
                {isExpanded && (
                  <p className="mt-2 text-sm text-muted-foreground animate-slide-down">
                    {todo.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <TodoDetailModal
        todo={todo}
        open={showModal}
        onOpenChange={setShowModal}
        onUpdate={onUpdate}
      />
    </>
  );
}
