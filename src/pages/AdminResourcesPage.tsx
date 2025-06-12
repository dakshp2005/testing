import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Clock, Users, BookOpen, Video, FileText, PenTool as Tool } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  category_id: string;
  tags: string[];
  url: string;
  image_url: string;
  duration_minutes: number;
  rating: number;
  view_count: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  resource_categories?: {
    name: string;
    color: string;
  };
}

interface ResourceCategory {
  id: string;
  name: string;
  color: string;
}

function AdminResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Manage Resources | Admin';
    loadResources();
    loadCategories();
  }, []);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_resources')
        .select(`
          *,
          resource_categories (
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('learning_resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      toast.success('Resource deleted successfully');
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const toggleFeatured = async (resourceId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({ is_featured: !currentFeatured })
        .eq('id', resourceId);

      if (error) throw error;

      toast.success(`Resource ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      loadResources();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const togglePublished = async (resourceId: string, currentPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('learning_resources')
        .update({ is_published: !currentPublished })
        .eq('id', resourceId);

      if (error) throw error;

      toast.success(`Resource ${!currentPublished ? 'published' : 'unpublished'} successfully`);
      loadResources();
    } catch (error) {
      console.error('Error updating published status:', error);
      toast.error('Failed to update published status');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'course':
        return BookOpen;
      case 'article':
        return FileText;
      case 'tool':
        return Tool;
      default:
        return BookOpen;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || resource.category_id === selectedCategory;
    const matchesType = !selectedType || resource.type === selectedType;
    const matchesDifficulty = !selectedDifficulty || resource.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Learning Resources</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Create, edit, and organize learning materials for the platform
            </p>
          </div>
          <Link
            to="/admin/resources/add"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Resource
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="course">Course</option>
            <option value="tutorial">Tutorial</option>
            <option value="article">Article</option>
            <option value="video">Video</option>
            <option value="book">Book</option>
            <option value="tool">Tool</option>
            <option value="documentation">Documentation</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => {
          const TypeIcon = getTypeIcon(resource.type);
          return (
            <div
              key={resource.id}
              className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden"
            >
              {/* Resource Image */}
              <div className="relative h-48 bg-gray-100 dark:bg-dark-border">
                {resource.image_url ? (
                  <img
                    src={resource.image_url}
                    alt={resource.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <TypeIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {resource.is_featured && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                  {!resource.is_published && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Draft
                    </span>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => toggleFeatured(resource.id, resource.is_featured)}
                    className={`p-2 rounded-full transition-colors ${
                      resource.is_featured
                        ? 'bg-yellow-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-yellow-500 hover:text-white'
                    }`}
                    title={resource.is_featured ? 'Remove from featured' : 'Add to featured'}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => togglePublished(resource.id, resource.is_published)}
                    className={`p-2 rounded-full transition-colors ${
                      resource.is_published
                        ? 'bg-green-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-green-500 hover:text-white'
                    }`}
                    title={resource.is_published ? 'Unpublish' : 'Publish'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Resource Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block ${getDifficultyColor(resource.difficulty)} rounded-full px-3 py-1 text-xs font-medium`}>
                    {resource.difficulty}
                  </span>
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: resource.resource_categories?.color || '#5164E1' }}
                  >
                    {resource.resource_categories?.name || 'Uncategorized'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{resource.title}</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="flex items-center justify-between text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {resource.duration_minutes ? `${resource.duration_minutes}m` : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {resource.view_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {resource.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/admin/resources/edit/${resource.id}`}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            {searchTerm || selectedCategory || selectedType || selectedDifficulty
              ? 'Try adjusting your filters to see more resources.'
              : 'Get started by creating your first learning resource.'}
          </p>
          <Link to="/admin/resources/add" className="btn-primary">
            Add Your First Resource
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AdminResourcesPage;