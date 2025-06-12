import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Code, Award, Users, FileEdit, Download, Share2, Plus, Trophy, Github, Linkedin, Globe, ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { RainbowButton } from '../components/ui/rainbow-button';
import { Dialog } from '@headlessui/react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Profile {
  id: string;
  name: string;
  bio: string;
  github: string;
  linkedin: string;
  website: string;
  created_at: string;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string | null;
  progress: number;
  achievements: {
    title: string;
    description: string;
    icon_name: string;
    points: number;
  };
}

interface ProjectParticipation {
  project_id: string;
  role: string;
  joined_at: string;
  projects: {
    title: string;
    description: string;
    difficulty: string;
    category: string;
    tags: string[];
    created_at: string;
  };
}

function PortfolioPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userProjects, setUserProjects] = useState<ProjectParticipation[]>([]);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine if we're viewing our own profile or someone else's
  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    document.title = 'Portfolio | LearnFlow';
    if (targetUserId) {
      loadUserData();
    }
  }, [targetUserId]);

  const loadUserData = async () => {
    if (!targetUserId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError('User not found');
        } else {
          throw profileError;
        }
        return;
      }

      setProfile(profileData);

      // Load user achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements (
            title,
            description,
            icon_name,
            points
          )
        `)
        .eq('user_id', targetUserId)
        .not('earned_at', 'is', null);

      if (achievementsError) throw achievementsError;
      setUserAchievements(achievementsData || []);

      // Load user projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('project_participants')
        .select(`
          *,
          projects (
            title,
            description,
            difficulty,
            category,
            tags,
            created_at
          )
        `)
        .eq('user_id', targetUserId);

      if (projectsError) throw projectsError;
      setUserProjects(projectsData || []);

    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLinks = [
    {
      name: "GitHub",
      url: profile?.github || "",
      icon: <Github className="w-6 h-6" />
    },
    {
      name: "LinkedIn",
      url: profile?.linkedin || "",
      icon: <Linkedin className="w-6 h-6" />
    },
    {
      name: "Website",
      url: profile?.website || "",
      icon: <Globe className="w-6 h-6" />
    }
  ];

  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return Trophy;
      case 'award':
        return Award;
      default:
        return Award;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPoints = userAchievements.reduce((total, ua) => total + (ua.achievements?.points || 0), 0);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900">
        <Header />
        <main className="flex-grow flex items-center justify-center pt-28">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {error || 'User not found'}
            </h1>
            <p className="text-gray-500 dark:text-gray-300 mb-8">
              The user you're looking for doesn't exist or their profile is not available.
            </p>
            <Link to="/community" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Community
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-500">
      <Header />

      <main className="flex-grow pt-16 md:pt-28 pb-16">
        <div className="container max-w-5xl mx-auto">
          {/* Back Button for other users' profiles */}
          {!isOwnProfile && (
            <Link
              to="/community"
              className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Community
            </Link>
          )}

          {/* Profile Header */}
          <div className="relative flex flex-col md:flex-row items-center md:items-center gap-8 mb-12 mt-4 md:mt-8">
            {/* Avatar with glow */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full pointer-events-none z-0"
                style={{
                  filter: "blur(32px)",
                  background: "linear-gradient(135deg, #5164E1 0%, #A7D1F1 100%)",
                  opacity: 0.5
                }}
              />
              <div className="relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] flex items-center justify-center text-5xl font-bold text-white shadow-xl select-none">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 flex flex-col justify-center h-36 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white break-words">
                {profile.name || "User Name"}
              </h1>
              <p className="text-gray-500 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 mb-4">
                {profile.bio || "No bio available"}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-500 px-3 py-1 rounded-full text-xs font-medium">
                  Member since {formatDate(profile.created_at)}
                </span>
                <span className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
                  {totalPoints} points earned
                </span>
              </div>
              <div className="flex gap-3 justify-center md:justify-start">
                <RainbowButton
                  className="text-white dark:text-black shadow-lg hover:shadow-2xl hover:scale-105"
                  onClick={() => setShowSocialModal(true)}
                >
                  Connect
                </RainbowButton>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 flex flex-col items-center p-8">
              <div className="mb-3">
                <Trophy className="w-6 h-6 text-primary-500" />
              </div>
              <div className="text-3xl font-bold text-primary-500 dark:text-primary-400">{userAchievements.length}</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">Achievements</div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 flex flex-col items-center p-8">
              <div className="mb-3">
                <Code className="w-6 h-6 text-primary-500" />
              </div>
              <div className="text-3xl font-bold text-primary-500 dark:text-primary-400">{userProjects.length}</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">Projects</div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 flex flex-col items-center p-8">
              <div className="mb-3">
                <Award className="w-6 h-6 text-primary-500" />
              </div>
              <div className="text-3xl font-bold text-primary-500 dark:text-primary-400">{totalPoints}</div>
              <div className="text-gray-500 dark:text-gray-300 mt-1">Total Points</div>
            </div>
          </div>

          {/* Achievements */}
          {userAchievements.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Achievements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userAchievements.map((userAchievement) => {
                  const Icon = getAchievementIcon(userAchievement.achievements?.icon_name || 'award');
                  return (
                    <div
                      key={userAchievement.achievement_id}
                      className="rounded-2xl p-6 shadow-xl flex flex-col items-center text-center border-2 border-transparent bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] relative overflow-hidden"
                      style={{ minHeight: 180 }}
                    >
                      <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20 mb-4 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{userAchievement.achievements?.title}</h3>
                      <p className="text-white/80 text-sm mb-2">{userAchievement.achievements?.description}</p>
                      <p className="text-white/60 text-xs">
                        Earned {formatDate(userAchievement.earned_at!)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects */}
          {userProjects.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {userProjects.map((participation) => (
                  <div
                    key={participation.project_id}
                    className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`inline-block ${getDifficultyColor(participation.projects.difficulty)} rounded-full px-3 py-1 text-xs font-medium`}>
                          {participation.projects.difficulty}
                        </div>
                        <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-500 px-2 py-1 rounded-full text-xs font-medium">
                          {participation.role}
                        </span>
                      </div>
                      
                      <h4 className="text-xl font-semibold mb-2 text-primary-500 dark:text-primary-400">
                        {participation.projects.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-300 text-sm mb-3 flex-1">
                        {participation.projects.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {participation.projects.tags?.map(tag => (
                          <span
                            key={tag}
                            className="bg-primary-50 dark:bg-primary-900/30 text-primary-500 px-2 py-1 rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-auto">
                        Joined {formatDate(participation.joined_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty States */}
          {userAchievements.length === 0 && userProjects.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {isOwnProfile ? "Start Your Journey" : "No Activity Yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-300 mb-8">
                {isOwnProfile 
                  ? "Join projects and earn achievements to build your portfolio."
                  : "This user hasn't joined any projects or earned achievements yet."
                }
              </p>
              {isOwnProfile && (
                <div className="flex gap-4 justify-center">
                  <Link to="/projects" className="btn-primary">
                    Browse Projects
                  </Link>
                  <Link to="/community" className="btn-secondary">
                    Join Community
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Social Links Modal */}
      <Dialog open={showSocialModal} onClose={() => setShowSocialModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={() => setShowSocialModal(false)} />
        <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 max-w-sm w-full z-10">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Connect with {profile.name || "User"}
          </h2>
          <ul className="space-y-4">
            {socialLinks.map(link => (
              <li key={link.name}>
                {link.url ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-500 hover:underline"
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </a>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    {link.icon}
                    <span>{link.name} (Not provided)</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <button
            className="mt-6 w-full py-2 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 transition"
            onClick={() => setShowSocialModal(false)}
          >
            Close
          </button>
        </div>
      </Dialog>
    </div>
  );
}

export default PortfolioPage;