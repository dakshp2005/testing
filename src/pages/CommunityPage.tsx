import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, Users, ChevronRight, Star, Plus, X, Edit, Eye, MessageSquare } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SearchBar from '../components/search/SearchBar';
import FilterBar from '../components/search/FilterBar';
import { useSearchFilter } from '../hooks/useSearchFilter';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const predefinedTags = [
  "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "C", "Go", "Rust", "Ruby",
  "PHP", "Swift", "Kotlin", "Scala", "Dart", "Objective-C", "Perl", "Haskell", "Elixir", "MATLAB"
];

interface StudyGroup {
  id: string;
  title: string;
  description: string;
  leader_id: string;
  schedule: string;
  max_members: number;
  level: string;
  category: string;
  tags: string[];
  status: string;
  created_at: string;
  leader_name?: string;
}

interface StudyGroupMember {
  group_id: string;
  user_id: string;
  role: string;
}

function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [yourCommunities, setYourCommunities] = useState<StudyGroup[]>([]);
  const [exploreCommunities, setExploreCommunities] = useState<StudyGroup[]>([]);
  const [members, setMembers] = useState<StudyGroupMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [groupForm, setGroupForm] = useState({
    title: '',
    description: '',
    schedule: '',
    max_members: 1,
    level: 'beginner',
    category: '',
    tags: [] as string[]
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    level: '',
    category: '',
    sort: ''
  });

  const filteredGroups = exploreCommunities
    .filter(group => {
      // Search filter
      const matchesSearch =
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // Level filter
      const matchesLevel = filter.level ? group.level === filter.level : true;

      // Category filter
      const matchesCategory = filter.category ? group.category === filter.category : true;

      return matchesSearch && matchesLevel && matchesCategory;
    })
    .sort((a, b) => {
      if (filter.sort === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // Add more sort options if needed
      return 0;
    });

  const getDifficultyColor = (level: string) => {
    switch (level) {
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

  useEffect(() => {
    document.title = 'Community | LearnFlow';
    loadStudyGroups();
    loadMembers();
  }, []);

  const loadStudyGroups = async () => {
    try {
      const { data: memberData } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user?.id);

      const memberGroupIds = memberData?.map(m => m.group_id) || [];

      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      const leaderIds = [...new Set(groupsData?.map(g => g.leader_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', leaderIds);

      const leaderMap = new Map(profilesData?.map(p => [p.id, p.name]) || []);

      const groupsWithLeaderNames = groupsData?.map(group => ({
        ...group,
        leader_name: leaderMap.get(group.leader_id) || 'Unknown'
      }));

      setYourCommunities(
        groupsWithLeaderNames?.filter(group => 
          group.leader_id === user?.id || memberGroupIds.includes(group.id)
        ) || []
      );

      setExploreCommunities(
        groupsWithLeaderNames?.filter(group => 
          group.leader_id !== user?.id && !memberGroupIds.includes(group.id)
        ) || []
      );

      setStudyGroups(groupsWithLeaderNames || []);
    } catch (error) {
      console.error('Error loading study groups:', error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('study_group_members')
        .select('*');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const handleGroupAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!groupForm.title || !groupForm.description || !groupForm.category || !groupForm.schedule) {
        throw new Error('Please fill in all required fields');
      }

      if (groupForm.description.length < 200) {
        throw new Error('Description must be at least 200 characters long');
      }

      if (isEditing && selectedGroup) {
        const { error } = await supabase
          .from('study_groups')
          .update({
            ...groupForm,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedGroup.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('study_groups')
          .insert([
            {
              ...groupForm,
              leader_id: user?.id,
              status: 'open'
            }
          ])
          .select()
          .single();

        if (error) throw error;

        const { error: memberError } = await supabase
          .from('study_group_members')
          .insert([
            {
              group_id: data.id,
              user_id: user?.id,
              role: 'leader'
            }
          ]);

        if (memberError) throw memberError;
      }

      setGroupForm({
        title: '',
        description: '',
        schedule: '',
        max_members: 1,
        level: 'beginner',
        category: '',
        tags: []
      });
      setIsModalOpen(false);
      setIsDetailsModalOpen(false);
      setSelectedGroup(null);
      setIsEditing(false);

      await Promise.all([loadStudyGroups(), loadMembers()]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (group: StudyGroup) => {
    navigate(`/community/${group.id}`);
  };

  const handleEditGroup = (group: StudyGroup) => {
    setSelectedGroup(group);
    setGroupForm({
      title: group.title,
      description: group.description,
      schedule: group.schedule,
      max_members: group.max_members,
      level: group.level,
      category: group.category,
      tags: group.tags
    });
    setIsModalOpen(true);
    setIsEditing(true);
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert([
          {
            group_id: groupId,
            user_id: user?.id,
            role: 'member'
          }
        ]);

      if (error) throw error;
      await Promise.all([loadStudyGroups(), loadMembers()]);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    setIsSubmitting(true);
    setError('');
    try {
      const { error } = await supabase
        .from('study_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      await Promise.all([loadStudyGroups(), loadMembers()]);
      setSelectedGroup(null);
      setIsModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsEditing(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGroupLeader = (groupLeaderId: string) => {
    return user?.id === groupLeaderId;
  };

  const isGroupMember = (groupId: string) => {
    return members.some(m => m.group_id === groupId && m.user_id === user?.id);
  };

  const getCurrentMemberCount = (groupId: string) => {
    return members.filter(m => m.group_id === groupId).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !groupForm.tags.includes(newTag)) {
        setGroupForm({
          ...groupForm,
          tags: [...groupForm.tags, newTag]
        });
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setGroupForm({
      ...groupForm,
      tags: groupForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Community</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Join study groups and connect with other learners
            </p>
            {/* Search and Filter moved here */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <SearchBar
                placeholder="Search study groups..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <FilterBar
                options={{
                  levels: ['beginner', 'intermediate', 'advanced'],
                  categories: ['programming', 'web-development', 'data-science', 'mobile-dev'],
                  sortOptions: ['newest', 'popular']
                }}
                value={filter}
                onChange={setFilter}
              />
            </div>
          </div>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditing(false);
              setGroupForm({
                title: '',
                description: '',
                schedule: '',
                max_members: 1,
                level: 'beginner',
                category: '',
                tags: []
              });
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Study Group
          </button>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Your Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yourCommunities.map(group => (
            <div key={group.id} className="card hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div className={`inline-block ${getDifficultyColor(group.level)} rounded-full px-3 py-1 text-xs font-medium`}>
                    {group.level}
                  </div>
                  {isGroupLeader(group.leader_id) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditGroup(group)}
                        className="text-gray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Group"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mt-3">{group.title}</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {group.schedule}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {getCurrentMemberCount(group.id)}/{group.max_members}
                  </span>
                </div>
              </div>

              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                <p>Led by {group.leader_name}</p>
                <p>Created on {formatDate(group.created_at)}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewDetails(group)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
          {yourCommunities.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                You haven't joined any study groups yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <div key={group.id} className="card hover:shadow-lg transition-all duration-300">
              <div className="mb-4">
                <div className="flex justify-between items-start">
                  <div className={`inline-block ${getDifficultyColor(group.level)} rounded-full px-3 py-1 text-xs font-medium`}>
                    {group.level}
                  </div>
                  {isGroupLeader(group.leader_id) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditGroup(group)}
                        className="text-gray-500 hover:text-primary-500 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete Group"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold mt-3">{group.title}</h3>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {group.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {group.schedule}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {getCurrentMemberCount(group.id)}/{group.max_members}
                  </span>
                </div>
              </div>

              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                <p>Led by {group.leader_name}</p>
                <p>Created on {formatDate(group.created_at)}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewDetails(group)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>

                {!isGroupLeader(group.leader_id) && !isGroupMember(group.id) && (
                  <button 
                    onClick={() => handleJoinGroup(group.id)}
                    className="btn-primary flex-1"
                    disabled={getCurrentMemberCount(group.id) >= group.max_members}
                  >
                    {getCurrentMemberCount(group.id) >= group.max_members ? 'Full' : 'Join Group'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
              <h2 className="text-2xl font-bold">{isEditing ? 'Edit Study Group' : 'Create Study Group'}</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditing(false);
                  setSelectedGroup(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleGroupAction} className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Group Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={groupForm.title}
                    onChange={(e) => setGroupForm({...groupForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description * (minimum 200 characters)
                  </label>
                  <textarea
                    id="description"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({...groupForm, description: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    required
                    minLength={200}
                    placeholder="Provide a detailed description of your study group (minimum 200 characters)"
                  ></textarea>
                  <span className="text-xs text-gray-400">
                    {groupForm.description.length} / min 200 characters
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium mb-1">
                      Level *
                    </label>
                    <select
                      id="level"
                      value={groupForm.level}
                      onChange={(e) => setGroupForm({...groupForm, level: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={groupForm.category}
                      onChange={(e) => setGroupForm({...groupForm, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="programming">Programming</option>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-dev">Mobile Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="machine-learning">Machine Learning</option>
                      <option value="devops">DevOps</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="schedule" className="block text-sm font-medium mb-1">
                      Schedule *
                    </label>
                    <input
                      type="text"
                      id="schedule"
                      value={groupForm.schedule}
                      onChange={(e) => setGroupForm({...groupForm, schedule: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Every Monday at 7 PM EST"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="max_members" className="block text-sm font-medium mb-1">
                      Max Members *
                    </label>
                    <input
                      type="number"
                      id="max_members"
                      value={groupForm.max_members}
                      onChange={(e) => setGroupForm({...groupForm, max_members: parseInt(e.target.value)})}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-1">
                    Tags (click to add or type and press Enter)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {predefinedTags.map(tag => {
                      const isSelected = groupForm.tags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => {
                            if (!isSelected) {
                              setGroupForm({ ...groupForm, tags: [...groupForm.tags, tag] });
                            } else {
                              setGroupForm({ ...groupForm, tags: groupForm.tags.filter(t => t !== tag) });
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm border transition
                            ${isSelected
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 border-gray-300 dark:border-dark-border hover:bg-primary-50 hover:border-primary-400'
                            }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    id="tags"
                    onKeyDown={handleTagInput}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Type and press Enter to add custom tag"
                    autoComplete="off"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {groupForm.tags.map(tag => (
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
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setSelectedGroup(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailsModalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
              <h2 className="text-2xl font-bold">Study Group Details</h2>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedGroup(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className={`inline-block ${getDifficultyColor(selectedGroup.level)} rounded-full px-3 py-1 text-xs font-medium mb-2`}>
                    {selectedGroup.level}
                  </div>
                  <h3 className="text-2xl font-bold">{selectedGroup.title}</h3>
                </div>
                {isGroupLeader(selectedGroup.leader_id) && (
                  <button 
                    onClick={() => {
                      handleEditGroup(selectedGroup);
                      setIsDetailsModalOpen(false);
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Group
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap break-words">
                    {selectedGroup.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 px-2 py-1 rounded-md text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Group Details</h4>
                    <ul className="space-y-2 text-light-text-secondary dark:text-dark-text-secondary">
                      <li className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Schedule: {selectedGroup.schedule}
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Members: {getCurrentMemberCount(selectedGroup.id)}/{selectedGroup.max_members}
                      </li>
                      <li>Category: {selectedGroup.category}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Leader Information</h4>
                    <ul className="space-y-2 text-light-text-secondary dark:text-dark-text-secondary">
                      <li>Led by: {selectedGroup.leader_name}</li>
                      <li>Created on: {formatDate(selectedGroup.created_at)}</li>
                    </ul>
                  </div>
                </div>

                {!isGroupLeader(selectedGroup.leader_id) && !isGroupMember(selectedGroup.id) && (
                  <div className="mt-8">
                    <button 
                      onClick={() => {
                        handleJoinGroup(selectedGroup.id);
                        setIsDetailsModalOpen(false);
                      }}
                      className="btn-primary w-full"
                      disabled={getCurrentMemberCount(selectedGroup.id) >= selectedGroup.max_members}
                    >
                      {getCurrentMemberCount(selectedGroup.id) >= selectedGroup.max_members ? 'Group is Full' : 'Join Group'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default CommunityPage;