import { useState, useCallback } from 'react';
import { supabase, Attachment } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useAttachments(todoId: string) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAttachments = useCallback(async () => {
    if (!todoId) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('todo_id', todoId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching attachments:', error);
    } else {
      setAttachments(data || []);
    }
    setLoading(false);
  }, [todoId]);

  const uploadAttachment = async (file: File) => {
    if (!user || !todoId) return;

    setUploading(true);
    const filePath = `${user.id}/${todoId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('todo-attachments')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: 'Error uploading file',
        description: uploadError.message,
        variant: 'destructive'
      });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('attachments').insert({
      todo_id: todoId,
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      file_type: file.type
    });

    if (dbError) {
      toast({
        title: 'Error saving attachment',
        description: dbError.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'File uploaded!' });
      fetchAttachments();
    }
    setUploading(false);
  };

  const deleteAttachment = async (attachment: Attachment) => {
    const { error: storageError } = await supabase.storage
      .from('todo-attachments')
      .remove([attachment.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    const { error: dbError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachment.id);

    if (dbError) {
      toast({
        title: 'Error deleting attachment',
        description: dbError.message,
        variant: 'destructive'
      });
    } else {
      toast({ title: 'Attachment deleted' });
      fetchAttachments();
    }
  };

  const getDownloadUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('todo-attachments')
      .createSignedUrl(filePath, 3600);
    
    return data?.signedUrl;
  };

  return {
    attachments,
    loading,
    uploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    getDownloadUrl
  };
}
