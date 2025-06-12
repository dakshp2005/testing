import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Clock, Users, Calendar, FileText, MessageSquare, 
  Link as LinkIcon, Plus, Edit, Check, X, ExternalLink
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  max_participants: number;
  category: string;
  created_by: string;
  created_at: string;
  status: string;
  start_date: string | null;
  target_completion_date: string | null;
  creator_name?: string;
  tags?: string[];
}

interface Timeline {
  id: string;
  phase: 'planning' | 'development' | 'testing' | 'launch';
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  start_date: string | null;
  end_date: string | null;
  description?: string;
  attachments?: string[];
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: 'document' | 'link' | 'forum';
  url: string | null;
  created_by: string;
  created_at: string;
  tags?: string[];
}

interface Participant {
  user_id: string;
  role: string;
  joined_at: string;
  name: string;
}

function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activePhase, setActivePhase] = useState<string>('planning');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    start_date: '',
    target_completion_date: '',
    difficulty: '',
    category: '',
    estimated_hours: 0,
    max_participants: 0,
    tags: [] as string[]
  });

  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'document' as const,
    url: '',
    tags: [] as string[]
  });

  const [updateForm, setUpdateForm] = useState({
    phase: 'planning' as const,
    content: '',
    status: 'pending' as const,
    start_date: '',
    end_date: '',
    description: '',
    attachments: [] as string[]
  });

  useEffect(() => {
    loadProjectDetails();
    loadParticipants();
    loadTimelines();
    loadResources();
  }, [id]);

  useEffect(() => {
    if (project) {
      setEditForm({
        title: project.title,
        description: project.description,
        status: project.status,
        start_date: project.start_date || '',
        target_completion_date: project.target_completion_date || '',
        difficulty: project.difficulty,
        category: project.category,
        estimated_hours: project.estimated_hours,
        max_participants: project.max_participants,
        tags: project.tags || []
      });
    }
  }, [project]);

  const loadProjectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:created_by (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setProject({
        ...data,
        creator_name: data.profiles.name
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading project details:', error);
      toast.error('Failed to load project details');
      setIsLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('project_participants')
        .select(`
          user_id,
          role,
          joined_at,
          profiles:user_id (
            name
          )
        `)
        .eq('project_id', id);

      if (participantsError) throw participantsError;

      setParticipants(
        participantsData.map(p => ({
          ...p,
          name: p.profiles.name
        }))
      );
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load participants');
    }
  };

  const loadTimelines = async () => {
    try {
      const { data, error } = await supabase
        .from('project_timelines')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTimelines(data);
    } catch (error) {
      console.error('Error loading timelines:', error);
      toast.error('Failed to load timelines');
    }
  };

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('project_resources')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast.error('Failed to load resources');
    }
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('projects')
        .update(editForm)
        .eq('id', id);

      if (error) throw error;

      toast.success('Project updated successfully');
      loadProjectDetails();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('project_resources')
        .insert([{
          ...resourceForm,
          project_id: id,
          created_by: user?.id
        }]);

      if (error) throw error;

      toast.success('Resource added successfully');
      loadResources();
      setIsResourceModalOpen(false);
      setResourceForm({
        title: '',
        description: '',
        type: 'document',
        url: '',
        tags: []
      });
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate date order
    if (
      updateForm.start_date &&
      updateForm.end_date &&
      new Date(updateForm.end_date) < new Date(updateForm.start_date)
    ) {
      toast.error('End date cannot be before start date');
      return;
    }
    try {
      const { error } = await supabase
        .from('project_timelines')
        .insert([{
          ...updateForm,
          project_id: id
        }]);

      if (error) throw error;

      toast.success('Timeline updated successfully');
      loadTimelines();
      setIsUpdateModalOpen(false);
      setUpdateForm({
        phase: 'planning',
        content: '',
        status: 'pending',
        start_date: '',
        end_date: '',
        description: '',
        attachments: []
      });
    } catch (error) {
      console.error('Error adding update:', error);
      toast.error('Failed to add update');
    }
  };

  const handleDeleteUpdate = async (timelineId: string) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;
    try {
      const { error } = await supabase
        .from('project_timelines')
        .delete()
        .eq('id', timelineId);

      if (error) throw error;

      toast.success('Timeline update deleted');
      loadTimelines();
    } catch (error) {
      console.error('Error deleting timeline update:', error);
      toast.error('Failed to delete update');
    }
  };

  const isProjectCreator = () => {
    return project?.created_by === user?.id;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || !project) {
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
          to="/projects"
          className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-4 text-light-text-secondary dark:text-dark-text-secondary">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {participants.length} Contributors
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created {formatDate(project.created_at)}
                </span>
              </div>
            </div>
            
            {isProjectCreator() && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Project
              </button>
            )}
          </div>

          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              project.difficulty === 'beginner'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : project.difficulty === 'intermediate'
                ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {project.difficulty}
            </span>
            <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-500 px-3 py-1 rounded-full text-sm font-medium">
              {project.category}
            </span>
            {project.tags?.map(tag => (
              <span
                key={tag}
                className="bg-gray-100 dark:bg-dark-border text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Timeline */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Project Timeline</h2>
                {isProjectCreator() && (
                  <button
                    onClick={() => setIsUpdateModalOpen(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Update
                  </button>
                )}
              </div>

              <div className="flex border-b border-gray-200 dark:border-dark-border mb-6">
                {['planning', 'development', 'testing', 'launch'].map(phase => (
                  <button
                    key={phase}
                    onClick={() => setActivePhase(phase)}
                    className={`px-4 py-2 font-medium capitalize transition-colors relative ${
                      activePhase === phase
                        ? 'text-primary-500'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500'
                    }`}
                  >
                    {phase}
                    {activePhase === phase && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {timelines
                  .filter(t => t.phase === activePhase)
                  .map(timeline => (
                    <div
                      key={timeline.id}
                      className="border-l-2 border-primary-500 pl-4 relative"
                    >
                      <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary-500"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="whitespace-pre-wrap">{timeline.content}</p>
                          {timeline.start_date && (
                            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                              {formatDate(timeline.start_date)}
                              {timeline.end_date && ` - ${formatDate(timeline.end_date)}`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            timeline.status === 'completed'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : timeline.status === 'in_progress'
                              ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                              : 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                          }`}>
                            {timeline.status}
                          </span>
                          {isProjectCreator() && (
                            <button
                              onClick={() => handleDeleteUpdate(timeline.id)}
                              className="ml-2 text-red-500 hover:text-red-700 p-1"
                              title="Delete update"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Resources</h2>
                {isProjectCreator() && (
                  <button
                    onClick={() => setIsResourceModalOpen(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Resource
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-start gap-4 p-3 rounded-full hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                  >
                    {resource.type === 'document' ? (
                      <FileText className="w-5 h-5 text-primary-500" />
                    ) : resource.type === 'forum' ? (
                      <MessageSquare className="w-5 h-5 text-primary-500" />
                    ) : (
                      <LinkIcon className="w-5 h-5 text-primary-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{resource.title}</h3>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-500 hover:text-primary-600"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      {resource.description && (
                        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contributors */}
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Contributors</h2>
              <div className="space-y-4">
                {participants.map(participant => (
                  <div
                    key={participant.user_id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {participant.role === 'creator' ? 'Project Creator' : 'Contributor'}
                      </p>
                    </div>
                    <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Joined {formatDate(participant.joined_at)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card dark:text-gray-100 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Project</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  >
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="launched">Launched</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.start_date.split('T')[0]}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Target Completion</label>
                  <input
                    type="date"
                    value={editForm.target_completion_date.split('T')[0]}
                    onChange={(e) => setEditForm({ ...editForm, target_completion_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {isResourceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card dark:text-gray-100 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Resource</h2>
              <button
                onClick={() => setIsResourceModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value as 'document' | 'link' | 'forum' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                >
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="forum">Forum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="https://"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsResourceModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-dark-card dark:text-gray-100 rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Timeline Update</h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Phase</label>
                <select
                  value={updateForm.phase}
                  onChange={(e) => setUpdateForm({ ...updateForm, phase: e.target.value as Timeline['phase'] })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                >
                  <option value="planning">Planning</option>
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="launch">Launch</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={updateForm.content}
                  onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-gray-400 dark:placeholder-gray-500"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={updateForm.start_date}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setUpdateForm((prev) => ({
                        ...prev,
                        start_date: newStart,
                        // If end_date is before new start_date, reset end_date
                        end_date:
                          prev.end_date && newStart && new Date(prev.end_date) < new Date(newStart)
                            ? ''
                            : prev.end_date,
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={updateForm.end_date}
                    min={updateForm.start_date || undefined}
                    onChange={(e) => setUpdateForm({ ...updateForm, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as Timeline['status'] })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ProjectDetailsPage;