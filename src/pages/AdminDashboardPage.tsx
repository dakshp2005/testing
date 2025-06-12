import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Code,
  MessageSquare,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Award,
  Eye,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { supabase } from "../lib/supabase";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalResources: number;
  totalCommunities: number;
  activeUsers: number;
  newUsersThisWeek: number;
}

interface Activity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
}

interface UserDetails {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalResources: 0,
    totalCommunities: 0,
    activeUsers: 0,
    newUsersThisWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [usersList, setUsersList] = useState<UserDetails[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Admin Dashboard | LearnFlow";
    loadDashboardStats();
    loadRecentActivities();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total projects
      const { count: totalProjects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      // Get total learning resources
      const { count: totalResources } = await supabase
        .from("learning_resources")
        .select("*", { count: "exact", head: true });

      // Get total study groups (communities)
      const { count: totalCommunities } = await supabase
        .from("study_groups")
        .select("*", { count: "exact", head: true });

      // Get new users this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { count: newUsersThisWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalProjects: totalProjects || 0,
        totalResources: totalResources || 0,
        totalCommunities: totalCommunities || 0,
        activeUsers: Math.floor((totalUsers || 0) * 0.7), // Estimate
        newUsersThisWeek: newUsersThisWeek || 0,
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivities(data || []);
    } catch (error) {
      console.error("Error loading recent activities:", error);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      action: "viewUsers",
    },
    {
      title: "Active Projects",
      value: stats.totalProjects,
      icon: Code,
      description: "Ongoing projects",
      clickable: false,
    },
    {
      title: "Learning Resources",
      value: stats.totalResources,
      icon: BookOpen,
      description: "Available resources",
      clickable: false,
    },
    {
      title: "Communities",
      value: stats.totalCommunities,
      icon: MessageSquare,
      description: "Active communities",
      clickable: false,
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: TrendingUp,
      description: "Users in the last 30 days",
      clickable: false,
    },
    {
      title: "New Users",
      value: stats.newUsersThisWeek,
      icon: Award,
      description: "Users registered this week",
      clickable: false,
    },
  ];

  const quickActions = [
    {
      title: "Add Learning Resource",
      description: "Create new courses, tutorials, and learning materials",
      icon: Plus,
      link: "/admin/resources/add",
      color: "bg-blue-500",
    },
    {
      title: "Manage Resources",
      description: "Edit, update, and organize learning resources",
      icon: BookOpen,
      link: "/admin/resources",
      color: "bg-green-500",
    },
    {
      title: "User Management",
      description: "View and manage user accounts and permissions",
      icon: Users,
      link: "/admin/users",
      color: "bg-purple-500",
    },
    {
      title: "Analytics",
      description: "View detailed analytics and reports",
      icon: BarChart3,
      link: "/admin/analytics",
      color: "bg-orange-500",
    },
    {
      title: "Content Moderation",
      description: "Review and moderate user-generated content",
      icon: Eye,
      link: "/admin/moderation",
      color: "bg-pink-500",
    },
    {
      title: "System Settings",
      description: "Configure platform settings and preferences",
      icon: Settings,
      link: "/admin/settings",
      color: "bg-indigo-500",
    },
  ];

  const handleCardClick = async (action: string) => {
    switch (action) {
      case "viewUsers":
        await loadUserDetails();
        break;
      // Add other cases as needed
    }
  };

  const loadUserDetails = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsersList(data || []);
      setShowUserModal(true);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error loading users");
    } finally {
      setIsLoadingUsers(false);
    }
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
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Manage and monitor the LearnFlow platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                onClick={() => stat.action === "viewUsers" && loadUserDetails()}
                className={`card ${
                  stat.action === "viewUsers"
                    ? "cursor-pointer hover:shadow-xl transition-all duration-300"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary-500/10">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              function handleQuickAction(link: string): void {
                navigate(link);
              }
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.link)}
                  className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-100 dark:border-dark-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left w-full"
                >
                  <div
                    className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-100 dark:border-dark-border">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-border rounded-lg"
              >
                <div
                  className={`w-10 h-10 ${getActivityColor(
                    activity.action_type
                  )} rounded-full flex items-center justify-center`}
                >
                  {getActivityIcon(activity.action_type)}
                </div>
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {formatTimestamp(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User List Modal */}
        {showUserModal && (
          <div
            className="modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowUserModal(false);
            }}
          >
            <div className="modal-content w-full max-w-4xl m-4">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">User Management</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {usersList.map((user) => (
                      <div
                        key={user.id}
                        className="py-4 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-medium">
                            {user.full_name || "Unnamed User"}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Helper functions
const getActivityColor = (actionType: string) => {
  const colors: { [key: string]: string } = {
    resource_creation_started: "bg-blue-500",
    user_management_accessed: "bg-green-500",
    settings_updated: "bg-purple-500",
    // Add more action types and colors
  };
  return colors[actionType] || "bg-gray-500";
};

const getActivityIcon = (actionType: string) => {
  const icons: { [key: string]: JSX.Element } = {
    resource_creation_started: <Plus className="w-5 h-5 text-white" />,
    user_management_accessed: <Users className="w-5 h-5 text-white" />,
    settings_updated: <Settings className="w-5 h-5 text-white" />,
    // Add more action types and icons
  };
  return icons[actionType] || <FileText className="w-5 h-5 text-white" />;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / 1000 / 60
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return date.toLocaleDateString();
};

export default AdminDashboardPage;
