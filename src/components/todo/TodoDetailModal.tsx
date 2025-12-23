import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/lib/supabase';
import { useAttachments } from '@/hooks/useAttachments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Download, Trash2, Loader2, FileText, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

type TodoDetailModalProps = {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
};

export default function TodoDetailModal({ todo, open, onOpenChange, onUpdate }: TodoDetailModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo.due_date ? new Date(todo.due_date) : undefined
  );
  const [isRecurring, setIsRecurring] = useState(todo.is_recurring);
  const [recurrencePattern, setRecurrencePattern] = useState(todo.recurrence_pattern || 'daily');
  const [recurrenceInterval, setRecurrenceInterval] = useState(todo.recurrence_interval || 1);

  const {
    attachments,
    loading: attachmentsLoading,
    uploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    getDownloadUrl
  } = useAttachments(todo.id);

  useEffect(() => {
    if (open) {
      fetchAttachments();
    }
  }, [open, fetchAttachments]);

  useEffect(() => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setDueDate(todo.due_date ? new Date(todo.due_date) : undefined);
    setIsRecurring(todo.is_recurring);
    setRecurrencePattern(todo.recurrence_pattern || 'daily');
    setRecurrenceInterval(todo.recurrence_interval || 1);
  }, [todo]);

  const handleSave = () => {
    onUpdate(todo.id, {
      title,
      description: description || null,
      due_date: dueDate?.toISOString() || null,
      is_recurring: isRecurring,
      recurrence_pattern: isRecurring ? recurrencePattern as 'daily' | 'weekly' | 'monthly' : null,
      recurrence_interval: isRecurring ? recurrenceInterval : null
    });
    onOpenChange(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        continue;
      }
      await uploadAttachment(file);
    }
    e.target.value = '';
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const url = await getDownloadUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    return FileText;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Todo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary"
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
                  className="pointer-events-auto"
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

          <div className="space-y-3">
            <Label className="text-foreground">Attachments</Label>
            
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">
                    Drop files or click to upload
                  </span>
                </>
              )}
            </label>

            {attachmentsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((attachment) => {
                  const FileIcon = getFileIcon(attachment.file_type);
                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 group"
                    >
                      <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{attachment.file_name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file_size)}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteAttachment(attachment)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
          >
            Save changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
