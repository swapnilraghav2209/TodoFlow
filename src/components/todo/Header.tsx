import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

type HeaderProps = {
  user: User;
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  onSignOut: () => void;
};

export default function Header({ user, stats, onSignOut }: HeaderProps) {
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <header className="glass rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold gradient-text">TodoFlow</h1>
            <p className="text-sm text-muted-foreground">Welcome, {displayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{stats.completed}</span>
                /{stats.total} done
              </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{completionRate}%</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
