import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

type TodoInputProps = {
  onAdd: (title: string) => void;
};

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1 relative">
        <Input
          type="text"
          placeholder="Add a new todo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 pl-4 pr-4 bg-card/50 border-border focus:border-primary text-foreground placeholder:text-muted-foreground text-base glass"
        />
      </div>
      <Button
        type="submit"
        disabled={!title.trim()}
        className="h-12 px-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-medium glow-sm"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add
      </Button>
    </form>
  );
}
