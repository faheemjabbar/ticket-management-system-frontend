'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { commentAPI, type Comment } from '@/lib/api';
import { MessageSquare, Send, Trash2, Edit2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TicketCommentsProps {
  ticketId: string;
}

export default function TicketComments({ ticketId }: TicketCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Check if user can perform CRUD operations (dev, qa, pm only)
  const canManageComments = user && ['developer', 'qa', 'project-manager'].includes(user.role);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [ticketId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentAPI.getByTicketId(ticketId);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (!canManageComments) {
      toast.error('You do not have permission to add comments');
      return;
    }

    try {
      setIsSubmitting(true);
      const comment = await commentAPI.create(ticketId, {
        content: newComment.trim(),
      });
      setComments(prev => [...prev, comment]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const updated = await commentAPI.update(commentId, {
        content: editContent.trim(),
      });
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      setEditingId(null);
      setEditContent('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentAPI.delete(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Comments</h3>
        </div>
        <div className="text-center py-8 text-xs text-gray-500">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comments List */}
      <div className="divide-y divide-gray-200">
        {comments.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No comments yet</p>
            {canManageComments && (
              <p className="text-[10px] text-gray-400 mt-1">Be the first to comment</p>
            )}
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-semibold text-xs">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-900">
                      {comment.authorName}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-1 bg-orange-600 text-white rounded text-[10px] font-medium hover:bg-orange-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-medium hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {canManageComments && user?.id === comment.authorId && editingId !== comment.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(comment)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Edit comment"
                    >
                      <Edit2 className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                      title="Delete comment"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {canManageComments && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleAddComment}>
            <div className="flex items-start gap-3">
              {/* User Avatar */}
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-semibold text-xs">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Input */}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3 h-3" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
