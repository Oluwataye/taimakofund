import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, XCircle, Trash2, Eye, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  moderated: boolean;
  created_at: string;
  user_id: string;
  campaign_id: string;
  profiles: {
    full_name: string;
  };
  campaigns: {
    title: string;
  };
}

export default function Comments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [statusFilter]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('campaign_comments')
        .select(`
          *,
          profiles!user_id(full_name),
          campaigns!campaign_id(title)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter === 'pending') {
        query = query.eq('moderated', false);
      } else if (statusFilter === 'approved') {
        query = query.eq('moderated', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data as any || []);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (commentId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaign_comments')
        .update({ moderated: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment approved',
      });

      setSelectedComment(null);
      fetchComments();
    } catch (error: any) {
      console.error('Error approving comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve comment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaign_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Comment deleted',
      });

      setSelectedComment(null);
      fetchComments();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedComments.length === 0) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaign_comments')
        .update({ moderated: true })
        .in('id', selectedComments);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${selectedComments.length} comments approved`,
      });

      setSelectedComments([]);
      fetchComments();
    } catch (error: any) {
      console.error('Error bulk approving comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve comments',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('campaign_comments')
        .delete()
        .in('id', selectedComments);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${selectedComments.length} comments deleted`,
      });

      setSelectedComments([]);
      fetchComments();
    } catch (error: any) {
      console.error('Error bulk deleting comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comments',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(c => c.id));
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.campaigns.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comment Moderation</h1>
        <p className="text-muted-foreground">Review and moderate user comments</p>
      </div>

      {/* Filters & Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Comments</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedComments.length > 0 && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedComments.length} selected
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkApprove}
                disabled={processing}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={processing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredComments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No comments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {/* Select All */}
          <div className="flex items-center gap-2 px-4 py-2">
            <Checkbox
              checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">Select all</span>
          </div>

          {filteredComments.map((comment) => (
            <Card key={comment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedComments.includes(comment.id)}
                    onCheckedChange={() => toggleCommentSelection(comment.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{comment.profiles.full_name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                          <Badge variant={comment.moderated ? 'default' : 'secondary'}>
                            {comment.moderated ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          On: <span className="font-medium">{comment.campaigns.title}</span>
                        </p>
                        <p className="text-sm mt-2 line-clamp-2">{comment.content}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedComment(comment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!comment.moderated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(comment.id)}
                            disabled={processing}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(comment.id)}
                          disabled={processing}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Comment Details Dialog */}
      <Dialog open={!!selectedComment} onOpenChange={() => setSelectedComment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
            <DialogDescription>
              Review the full comment and take action
            </DialogDescription>
          </DialogHeader>

          {selectedComment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Author</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedComment.profiles.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <div className="mt-1">
                    <Badge variant={selectedComment.moderated ? 'default' : 'secondary'}>
                      {selectedComment.moderated ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Campaign</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedComment.campaigns.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedComment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Comment Content</p>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {selectedComment.content}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedComment && !selectedComment.moderated && (
              <Button
                onClick={() => handleApprove(selectedComment.id)}
                disabled={processing}
              >
                {processing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve
              </Button>
            )}
            {selectedComment && (
              <Button
                variant="destructive"
                onClick={() => handleDelete(selectedComment.id)}
                disabled={processing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
