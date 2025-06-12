import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface ResourceCategory {
  id: string;
  name: string;
  color: string;
}

interface ResourceForm {
  title: string;
  description: string;
  content: string;
  type: string;
  difficulty: string;
  category_id: string;
  tags: string[];
  url: string;
  image_url: string;
  duration_minutes: number;
  is_featured: boolean;
  is_published: boolean;
}

function AdminAddResourcePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ResourceForm>({
    title: '',
    description: '',
    content: '',
    type: 'course',
    difficulty: 'beginner',
    category_id: '',
    tags: [],
    url: '',
    image_url: '',
    duration_minutes: 0,
    is_featured: false,
    is_published: true
  });

  useEffect(() => {
    document.title = `${isEditing ? 'Edit' : 'Add'} Resource | Admin`;
    loadCategories();
    if (isEditing) {
      loadResource();
    }
  }, [id, isEditing]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const loadResource = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title || '',
        description: data.description || '',
        content: data.content || '',
        type: data.type || 'course',
        difficulty: data.difficulty || 'beginner',
        category_id: data.category_id || '',
        tags: data.tags || [],
        url: data.url || '',
        image_url: data.image_url || '',
        duration_minutes: data.duration_minutes || 0,
        is_featured: data.is_featured || false,
        is_published: data.is_published || true
      });
    } catch (error) {
      console.error('Error loading resource:', error);
      toast.error('Failed to load resource');
      navigate('/admin/resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.description || !formData.category_id) {
        throw new Error('Please fill in all required fields');
      }

      const resourceData = {
        ...formData,
        created_by: user?.id,
        updated_by: user?.id
      };

      if (isEditing) {
        const { error } = await supabase
          .from('learning_resources')
          .update(resourceData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Resource updated successfully');
      } else {
        const { error } = await supabase
          .from('learning_resources')
          .insert([resourceData]);

        if (error) throw error;
        toast.success('Resource created successfully');
      }

      navigate('/admin/resources');
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (isLoading) {
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
        <button
          onClick={() => navigate('/admin/resources')}
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Resources
        </button>

        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? 'Edit Learning Resource' : 'Add Learning Resource'}
        </h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          {isEditing ? 'Update the learning resource details' : 'Create a new learning resource for the platform'}
        </p>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-border">
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium mb-1">
                    Type *
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="course">Course</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="article">Article</option>
                    <option value="video">Video</option>
                    <option value="book">Book</option>
                    <option value="tool">Tool</option>
                    <option value="documentation">Documentation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
                    Difficulty *
                  </label>
                  <select
                    id="difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category_id" className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium mb-1">
                  Resource URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label htmlFor="image_url" className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Detailed content about the resource..."
                />
              </div>

              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  onKeyDown={handleTagInput}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type and press Enter to add tags"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_featured" className="ml-2 block text-sm">
                    Featured Resource
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="is_published" className="ml-2 block text-sm">
                    Publish Resource
                  </label>
                </div>
              </div>

              {/* Image Preview */}
              {formData.image_url && (
                <div>
                  <label className="block text-sm font-medium mb-1">Image Preview</label>
                  <div className="border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden">
                    <img
                      src={formData.image_url}
                      alt="Resource preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/resources')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default AdminAddResourcePage;