import { useEffect, useState } from 'react';
import { Trophy, Star, Medal, Award } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  points: number;
  criteria: string;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string | null;
  progress: number;
}

function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    document.title = 'Achievements | LearnFlow';
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      // Load all achievements
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Load user's achievements
      const { data: userAchievementsData, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user?.id);

      if (userAchievementsError) throw userAchievementsError;

      setAchievements(achievementsData || []);
      setUserAchievements(userAchievementsData || []);

      // Calculate total points
      const points = userAchievementsData?.reduce((total, ua) => {
        const achievement = achievementsData?.find(a => a.id === ua.achievement_id);
        return total + (achievement?.points || 0);
      }, 0);

      setTotalPoints(points || 0);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return Trophy;
      case 'star':
        return Star;
      case 'medal':
        return Medal;
      default:
        return Award;
    }
  };

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Track your progress and earn rewards for your accomplishments
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Total Points</h3>
            <Trophy className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-primary-500">{totalPoints}</p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Keep earning to unlock more!
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Achievements Earned</h3>
            <Medal className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-primary-500">
            {userAchievements.filter(ua => ua.earned_at).length}
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Out of {achievements.length} total
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Next Milestone</h3>
            <Star className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-primary-500">
            {achievements.length - userAchievements.filter(ua => ua.earned_at).length}
          </p>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">
            Achievements remaining
          </p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map(achievement => {
          const userAchievement = getUserAchievement(achievement.id);
          const Icon = getIconComponent(achievement.icon_name);
          const isEarned = userAchievement?.earned_at;
          const progress = userAchievement?.progress || 0;

          return (
            <div 
              key={achievement.id} 
              className={`bg-white dark:bg-dark-card rounded-xl p-6 shadow-lg border-2 transition-all duration-300 ${
                isEarned 
                  ? 'border-primary-500 hover:shadow-xl hover:-translate-y-1' 
                  : 'border-transparent hover:border-gray-200 dark:hover:border-dark-border'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isEarned 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 dark:bg-dark-border text-gray-400'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-500">
                    {achievement.points} points
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">{achievement.title}</h3>
              <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-4">
                {achievement.description}
              </p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className={isEarned ? 'text-primary-500' : ''}>
                    {isEarned ? 'Completed!' : `${progress}%`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isEarned ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ width: `${isEarned ? 100 : progress}%` }}
                  ></div>
                </div>
                {isEarned && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Earned on {new Date(userAchievement.earned_at!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export default AchievementsPage;