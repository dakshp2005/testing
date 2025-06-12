import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ChevronLeft, Image as ImageIcon, Link as LinkIcon, Send, Trash, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface StudyGroup {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  estimated_hours: number;
  max_participants: number;
  category: string;
  leader_id: string;
  created_at: string;
  creator_name?: string;
  schedule: string;
}

interface Post {
  id: string;
  content: string;
  image_path?: string;
  link_url?: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  upvotes?: number;
  downvotes?: number;
  user_vote?: 'up' | 'down' | null;
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    name: string;
  };
}

function CommunityDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({
    content: '',
    link_url: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    loadGroupDetails();
    loadMembers();
    loadPosts();

    // Subscribe to new posts
    const postsSubscription = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_group_posts',
          filter: `group_id=eq.${id}`,
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      postsSubscription.unsubscribe();
    };
  }, [id]);

  const loadGroupDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          profiles:leader_id (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setGroup({
        ...data,
        creator_name: data.profiles.name
      });
    } catch (error) {
      console.error('Error loading group details:', error);
      toast.error('Failed to load group details');
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('study_group_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles:user_id (
            name
          )
        `)
        .eq('group_id', id);

      if (error) throw error;

      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Failed to load members');
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('study_group_posts')
        .select(`
          *,
          profiles:user_id (
            name
          ),
          study_group_post_votes (
            vote_type,
            user_id
          )
        `)
        .eq('group_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(
        data.map(post => {
          const upvotes = post.study_group_post_votes?.filter(v => v.vote_type === 'up').length || 0;
          const downvotes = post.study_group_post_votes?.filter(v => v.vote_type === 'down').length || 0;
          const user_vote = post.study_group_post_votes?.find(v => v.user_id === user?.id)?.vote_type || null;
          return {
            ...post,
            user_name: post.profiles?.name,
            upvotes,
            downvotes,
            user_vote,
          };
        })
      );
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    setIsSubmitting(true);
    try {
      let imagePath = null;

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('study-group-posts')
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;
        imagePath = filePath;
      }

      // Create post
      const { data, error } = await supabase
        .from('study_group_posts')
        .insert([
          {
            group_id: id,
            user_id: user?.id,
            content: newPost.content,
            image_path: imagePath,
            link_url: newPost.link_url
          }
        ])
        .select(`
          *,
          profiles:user_id (
            name
          )
        `)
        .single();

      if (error) throw error;

      // Optimistically update posts list
      setPosts(prev => [
        {
          ...data,
          user_name: data.profiles?.name || "You"
        },
        ...prev
      ]);

      // Reset form
      setNewPost({
        content: '',
        link_url: ''
      });
      handleRemoveImage();
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (post: Post) => {
    try {
      // Delete image if exists
      if (post.image_path) {
        const { error: storageError } = await supabase.storage
          .from('study-group-posts')
          .remove([post.image_path]);

        if (storageError) throw storageError;
      }

      // Delete post
      const { error } = await supabase
        .from('study_group_posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast.success('Post deleted successfully');
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getImageUrl = (imagePath: string) => {
    return supabase.storage
      .from('study-group-posts')
      .getPublicUrl(imagePath).data.publicUrl;
  };

  const isGroupLeader = () => {
    return members.some(m => m.user_id === user?.id && m.role === 'leader');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) {
      toast.error('You must be logged in to vote.');
      return;
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('study_group_post_votes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    let newVoteType = voteType;
    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote
        await supabase
          .from('study_group_post_votes')
          .delete()
          .eq('id', existingVote.id);
        newVoteType = null;
      } else {
        // Update vote
        await supabase
          .from('study_group_post_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
      }
    } else {
      // Insert new vote
      await supabase
        .from('study_group_post_votes')
        .insert([{ post_id: postId, user_id: user.id, vote_type: voteType }]);
    }

    // Refresh posts to update vote counts and user_vote
    await loadPosts();
  };

  // Helper to truncate description
  const DESCRIPTION_LIMIT = 300; // characters

  if (!group) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <Link
          to="/community"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Communities
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.title}</h1>
            <div className="flex items-center gap-4 text-light-text-secondary dark:text-dark-text-secondary">
              <span>Created by {group.creator_name}</span>
              <span>•</span>
              <span>{formatDate(group.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <div className="relative">
              <p
                className={`text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap break-words transition-all duration-200 ${
                  !showFullDescription && group.description.length > DESCRIPTION_LIMIT
                    ? 'line-clamp-5 max-h-40 overflow-hidden'
                    : ''
                }`}
                style={{
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {group.description}
              </p>
              {!showFullDescription && group.description.length > DESCRIPTION_LIMIT && (
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-dark-card to-transparent flex items-end justify-center pointer-events-none" />
              )}
              {group.description.length > DESCRIPTION_LIMIT && (
                <button
                  className="mt-2 text-primary-500 hover:underline font-medium"
                  onClick={() => setShowFullDescription((prev) => !prev)}
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>

          {/* Posts Section */}
          <div className="space-y-6">
            {isGroupLeader() && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Create Post</h2>
                <form onSubmit={handleSubmitPost}>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share updates with your group members..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-4"
                    rows={4}
                  ></textarea>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative mb-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded-lg max-h-64 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 mb-4">
                    <input
                      type="url"
                      value={newPost.link_url}
                      onChange={(e) => setNewPost({ ...newPost, link_url: e.target.value })}
                      placeholder="Link URL (optional)"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-primary-500 transition-colors"
                        title="Add Image"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-primary-500 transition-colors"
                        title="Add Link"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newPost.content.trim()}
                      className="btn-primary flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-dark-card rounded-xl shadow-md p-5 flex gap-4 relative border border-gray-100 dark:border-dark-border hover:shadow-lg transition-shadow"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-xl font-bold text-primary-500">
                        {post.user_name?.[0] || "U"}
                      </div>
                    </div>
                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base truncate">{post.user_name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">• {formatDate(post.created_at)}</span>
                      </div>
                      <p className="mb-3 whitespace-pre-wrap text-gray-800 dark:text-gray-100 text-[15px]">{post.content}</p>
                      {post.image_path && (
                        <div className="mb-3">
                          <img
                            src={getImageUrl(post.image_path)}
                            alt="Post attachment"
                            className="rounded-lg max-h-80 object-cover border border-gray-200 dark:border-dark-border"
                          />
                        </div>
                      )}
                      {post.link_url && (
                        <a
                          href={post.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-lg text-sm font-medium transition"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          {post.link_url}
                        </a>
                      )}
                      {/* Actions */}
                      <div className="flex items-center gap-6 mt-3 text-gray-500 dark:text-gray-400 text-sm">
                        <button
                          className={`flex items-center gap-1 hover:text-primary-500 transition-colors ${post.user_vote === 'up' ? 'text-primary-500 font-bold' : ''}`}
                          onClick={() => handleVote(post.id, 'up')}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M7 15l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Upvote {post.upvotes > 0 && <span>{post.upvotes}</span>}
                        </button>
                        <button
                          className={`flex items-center gap-1 hover:text-primary-500 transition-colors ${post.user_vote === 'down' ? 'text-primary-500 font-bold' : ''}`}
                          onClick={() => handleVote(post.id, 'down')}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17 9l-5 5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Downvote {post.downvotes > 0 && <span>{post.downvotes}</span>}
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-gray-400 cursor-not-allowed"
                          onClick={() => toast.info('Comments coming soon!')}
                          tabIndex={0}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Comment
                        </button>
                        {post.user_id === user?.id && (
                          <button
                            onClick={() => {
                              setPostToDelete(post);
                              setIsConfirmOpen(true);
                            }}
                            className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-light-text-secondary dark:text-dark-text-secondary">
                No posts yet
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Info */}
          <div className="card">
            <h1 className="text-xl font-semibold mb-4">Group Info</h1>
            <table className="w-full text-left">
              <tbody>
                <tr>
                  <th className="font-medium text-sm text-gray-700 dark:text-gray-200 align-top py-1">Schedule</th>
                  <td className="py-1">
                    <span className="flex items-center text-light-text-secondary dark:text-dark-text-secondary">
                      <Clock className="w-4 h-4 mr-2" />
                      {group.schedule}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="font-medium text-sm text-gray-700 dark:text-gray-200 align-top py-1">Members</th>
                  <td className="py-1">
                    <span className="flex items-center text-light-text-secondary dark:text-dark-text-secondary">
                      <Users className="w-4 h-4 mr-2" />
                      {members.length} 
                      <span className="ml-2 text-xs text-gray-500">
                        (Max allowed: {group.max_members})
                      </span>
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="font-medium text-sm text-gray-700 dark:text-gray-200 align-top py-1">Category</th>
                  <td className="py-1">
                    <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-500 px-3 py-1 rounded-full text-sm">
                      {group.category}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="font-medium text-sm text-gray-700 dark:text-gray-200 align-top py-1">Tags</th>
                  <td className="py-1">
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Members List */}
            <div className="card">
            <h2 className="text-xl font-semibold mb-4">Members</h2>
            <div className="space-y-4">
              {members.map(member => (
              <div
                key={member.user_id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
              >
                <div className="flex flex-col">
                <button
                  type="button"
                  className="font-medium text-primary-500 hover:underline focus:outline-none text-left"
                  onClick={() => navigate(`/portfolio/${member.user_id}`)}
                >
                  {member.profiles?.name || "User"}
                </button>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {member.role === 'leader' ? 'Group Leader' : 'Member'}
                </p>
                </div>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary sm:text-right">
                Joined {member.joined_at ? formatDate(member.joined_at) : ""}
                </span>
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isConfirmOpen && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete this post?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={async () => {
                  await handleDeletePost(postToDelete);
                  setIsConfirmOpen(false);
                  setPostToDelete(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CommunityDetailsPage;