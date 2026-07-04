import React, { useState } from 'react';
import { Send, User } from 'lucide-react';

function CommentSection({ comments, onAddComment, isAuthenticated, isLoading }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">
        Comments ({comments?.length || 0})
      </h3>

      {/* Add comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex items-start space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !newComment.trim()}
            className="bg-primary text-white p-2.5 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm">
          Please <a href="/login" className="text-primary hover:underline">login</a> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {comments?.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="flex space-x-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex-shrink-0">
                {comment.user?.profileImage ? (
                  <img
                    src={comment.user.profileImage}
                    alt={comment.user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">
                    {comment.user?.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 mt-0.5 break-words">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;