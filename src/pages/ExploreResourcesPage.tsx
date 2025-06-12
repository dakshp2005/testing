import { useEffect, useState } from 'react';
import { Search, BookOpen, Star, Clock, Filter, Play, ExternalLink } from 'lucide-react';
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

function ExploreResourcesPage() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Explore Resources | LearnFlow';
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
        .eq('is_published', true)
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

  const handleResourceClick = async (resource: LearningResource) => {
    // Increment view count
    try {
      await supabase
        .from('learning_resources')
        .update({ view_count: (resource.view_count || 0) + 1 })
        .eq('id', resource.id);

      // Open resource URL if available
      if (resource.url) {
        window.open(resource.url, '_blank');
      }
    } catch (error) {
      console.error('Error updating view count:', error);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Play;
      case 'course':
        return BookOpen;
      case 'article':
        return BookOpen;
      default:
        return BookOpen;
    }
  };

  // Filter and sort resources
  const filteredResources = resources
    .filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = !selectedCategory || resource.category_id === selectedCategory;
      const matchesType = !selectedType || resource.type === selectedType;
      const matchesDifficulty = !selectedDifficulty || resource.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'popular':
          return (b.view_count || 0) - (a.view_count || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  // Separate featured resources
  const featuredResources = filteredResources.filter(r => r.is_featured);
  const regularResources = filteredResources.filter(r => !r.is_featured);

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
        <h1 className="text-3xl font-bold mb-2">Explore Resources</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Discover courses, tutorials, and learning materials curated by our team
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-dark-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
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
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map(resource => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-dark-card rounded-xl shadow-lg border-2 border-yellow-200 dark:border-yellow-800 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
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
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    </div>
                    {resource.url && (
                      <div className="absolute top-3 right-3">
                        <ExternalLink className="w-5 h-5 text-white bg-black/50 rounded p-1" />
                      </div>
                    )}
                  </div>
                  
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
                    
                    <div className="flex items-center justify-between text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      <div className="flex items-center gap-4">
                        {resource.duration_minutes > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {resource.duration_minutes}m
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          {resource.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-xs">
                        {resource.view_count || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Resources */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">
          {featuredResources.length > 0 ? 'All Resources' : 'Learning Resources'}
        </h2>
        
        {regularResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularResources.map(resource => {
              const TypeIcon = getTypeIcon(resource.type);
              return (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-dark-card rounded-xl shadow-lg border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
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
                    {resource.url && (
                      <div className="absolute top-3 right-3">
                        <ExternalLink className="w-5 h-5 text-white bg-black/50 rounded p-1" />
                      </div>
                    )}
                  </div>
                  
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
                    
                    <div className="flex items-center justify-between text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      <div className="flex items-center gap-4">
                        {resource.duration_minutes > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {resource.duration_minutes}m
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          {resource.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-xs">
                        {resource.view_count || 0} views
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No resources found</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              {searchTerm || selectedCategory || selectedType || selectedDifficulty
                ? 'Try adjusting your filters to see more resources.'
                : 'No learning resources are available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ExploreResourcesPage;