import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type TodoAddDialogProps = {
    onAdd: (title: string, description?: string, dueDate?: string, isRecurring?: boolean, recurrencePattern?: 'daily' | 'weekly' | 'monthly', recurrenceInterval?: number) => void;
};

export default function TodoAddDialog({ onAdd }: TodoAddDialogProps) {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>();
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [recurrenceInterval, setRecurrenceInterval] = useState(1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim()) {
            onAdd(
                title.trim(),
                description.trim() || undefined,
                dueDate?.toISOString(),
                isRecurring,
                isRecurring ? recurrencePattern : undefined,
                isRecurring ? recurrenceInterval : undefined
            );

            // Reset form
            setTitle('');
            setDescription('');
            setDueDate(undefined);
            setIsRecurring(false);
            setRecurrencePattern('daily');
            setRecurrenceInterval(1);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-medium glow-sm">
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Task
                </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Create New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-foreground">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task title..."
                            className="bg-muted/50 border-border focus:border-primary"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-foreground">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="bg-muted/50 border-border focus:border-primary resize-none"
                            placeholder="Add more details..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-foreground">Due Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal bg-muted/50 border-border hover:bg-muted",
                                        !dueDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                                    {dueDate && (
                                        <X
                                            className="ml-auto h-4 w-4 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDueDate(undefined);
                                            }}
                                        />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 glass border-border" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dueDate}
                                    onSelect={setDueDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="recurring" className="text-foreground cursor-pointer">Recurring Task</Label>
                            <Switch
                                id="recurring"
                                checked={isRecurring}
                                onCheckedChange={setIsRecurring}
                            />
                        </div>

                        {isRecurring && (
                            <div className="space-y-4 animate-slide-down">
                                <div className="flex gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-sm text-muted-foreground">Every</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            value={recurrenceInterval}
                                            onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                                            className="bg-muted/50 border-border"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Label className="text-sm text-muted-foreground">Period</Label>
                                        <Select value={recurrencePattern} onValueChange={(val) => setRecurrencePattern(val as 'daily' | 'weekly' | 'monthly')}>
                                            <SelectTrigger className="bg-muted/50 border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="glass border-border">
                                                <SelectItem value="daily">Day(s)</SelectItem>
                                                <SelectItem value="weekly">Week(s)</SelectItem>
                                                <SelectItem value="monthly">Month(s)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim()}
                            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
                        >
                            Create Task
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
