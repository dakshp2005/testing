import { useState, FormEvent, useEffect } from 'react';
import { User, Mail, Lock, BellRing, Settings, CreditCard, HelpCircle, ChevronRight, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from "sonner";

function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.name?.split(' ')[1] || '',
    email: user?.email || '',
    bio: user?.user_metadata?.bio || '',
    github: user?.user_metadata?.github || '',
    linkedin: user?.user_metadata?.linkedin || '',
    website: user?.user_metadata?.website || ''
  });

  // Security form state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    projectInvitations: true,
    forumReplies: true,
    promotionalEmails: false,
    messages: true,
    reminders: true
  });

  // Learning preferences state
  const [preferences, setPreferences] = useState({
    learningGoal: user?.user_metadata?.learningGoal || '',
    primaryInterest: user?.user_metadata?.primaryInterest || '',
    weeklyHours: user?.user_metadata?.weeklyHours || '',
    aiAssistant: true,
    personalizedContent: true
  });

  useEffect(() => {
    document.title = 'Profile Settings | LearnFlow';
    
    // Load user preferences from Supabase
    const loadUserPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData(prev => ({
            ...prev,
            bio: data.bio || ''
          }));
          
          setPreferences(prev => ({
            ...prev,
            learningGoal: data.learning_goal || '',
            primaryInterest: data.primary_interest || '',
            weeklyHours: data.weekly_hours || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    loadUserPreferences();
  }, [user]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          bio: profileData.bio,
          github: profileData.github,
          linkedin: profileData.linkedin,
          website: profileData.website
        }
      });

      if (updateError) throw updateError;

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          bio: profileData.bio,
          github: profileData.github,
          linkedin: profileData.linkedin,
          website: profileData.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
      toast.success("Profile updated!");
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
      toast.error("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: securityData.newPassword
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Password updated successfully!'
      });
      
      // Clear form
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to update password. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          notification_preferences: notifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Notification preferences updated successfully!'
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to update notification preferences. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferencesSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          learningGoal: preferences.learningGoal,
          primaryInterest: preferences.primaryInterest,
          weeklyHours: preferences.weeklyHours
        }
      });

      if (updateError) throw updateError;

      // Update profile preferences
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          learning_goal: preferences.learningGoal,
          primary_interest: preferences.primaryInterest,
          weekly_hours: preferences.weeklyHours,
          ai_preferences: {
            aiAssistant: preferences.aiAssistant,
            personalizedContent: preferences.personalizedContent
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setMessage({
        type: 'success',
        text: 'Learning preferences updated successfully!'
      });
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to update learning preferences. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-6 sticky top-24">
                <nav className="space-y-1">
                  <Link
                    to="/learn"
                    className="w-full flex items-center px-4 py-2.5 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-dark-border"
                  >
                    <Layout className="w-5 h-5 mr-3" />
                    <span>Dashboard</span>
                  </Link>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span>Profile Information</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-colors ${
                      activeTab === 'security'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    <Lock className="w-5 h-5 mr-3" />
                    <span>Security</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-colors ${
                      activeTab === 'notifications'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    <BellRing className="w-5 h-5 mr-3" />
                    <span>Notifications</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-colors ${
                      activeTab === 'preferences'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Preferences</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-colors ${
                      activeTab === 'billing'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 mr-3" />
                    <span>Billing</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('help')}
                    className={`w-full flex items-center px-4 py-2.5 rounded-full transition-colors ${
                      activeTab === 'help'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-dark-border'
                    }`}
                  >
                    <HelpCircle className="w-5 h-5 mr-3" />
                    <span>Help & Support</span>
                  </button>
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
                  <button
                    onClick={logout}
                    className="w-full flex items-center px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Success/Error Message */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-full ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold">Profile Information</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Update your personal information
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="flex flex-col md:flex-row gap-6 mb-6">
                        <div className="flex-1">
                          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="lastName"
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={profileData.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-gray-50 dark:bg-dark-border cursor-not-allowed"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="bio" className="block text-sm font-medium mb-1">
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={4}
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Tell us about yourself..."
                        ></textarea>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="github" className="block text-sm font-medium mb-1">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          id="github"
                          value={profileData.github}
                          onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://github.com/yourusername"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="linkedin" className="block text-sm font-medium mb-1">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          id="linkedin"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://linkedin.com/in/yourusername"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="website" className="block text-sm font-medium mb-1">
                          Personal Website
                        </label>
                        <input
                          type="url"
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold">Security</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Update your password and security settings
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleSecuritySubmit}>
                      <div className="mb-6">
                        <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary"
                        >
                          {isSubmitting ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold">Notification Settings</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Manage your notification preferences
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handleNotificationSubmit}>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Course Updates</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                              Receive updates about your enrolled courses
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.courseUpdates}
                              onChange={(e) => setNotifications({
                                ...notifications,
                                courseUpdates: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Project Invitations</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                              Receive notifications for project invitations
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.projectInvitations}
                              onChange={(e) => setNotifications({
                                ...notifications,
                                projectInvitations: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Forum Replies</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                              Get notified when someone replies to your posts
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.forumReplies}
                              onChange={(e) => setNotifications({
                                ...notifications,
                                forumReplies: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Promotional Emails</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                              Receive updates about new courses and features
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications.promotionalEmails}
                              onChange={(e) => setNotifications({
                                ...notifications,
                                promotionalEmails: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      </div>

                      <div className="mt-8 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'preferences' && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold">Learning Preferences</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Customize your learning experience
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <form onSubmit={handlePreferencesSubmit}>
                      <div className="mb-6">
                        <label htmlFor="learningGoal" className="block text-sm font-medium mb-1">
                          Primary Learning Goal
                        </label>
                        <select
                          id="learningGoal"
                          value={preferences.learningGoal}
                          onChange={(e) => setPreferences({...preferences, learningGoal: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select your goal</option>
                          <option value="career-change">Career Change</option>
                          <option value="skill-up">Skill Improvement</option>
                          <option value="certification">Professional Certification</option>
                          <option value="hobby">Personal Interest</option>
                        </select>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="primaryInterest" className="block text-sm font-medium mb-1">
                          Primary Field of Interest
                        </label>
                        <select
                          id="primaryInterest"
                          value={preferences.primaryInterest}
                          onChange={(e) => setPreferences({...preferences, primaryInterest: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select your field</option>
                          <option value="frontend">Frontend Development</option>
                          <option value="backend">Backend Development</option>
                          <option value="fullstack">Full Stack Development</option>
                          <option value="mobile">Mobile Development</option>
                          <option value="data-science">Data Science</option>
                          <option value="ui-ux">UI/UX Design</option>
                        </select>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="weeklyHours" className="block text-sm font-medium mb-1">
                          Hours Available Per Week
                        </label>
                        <select
                          id="weeklyHours"
                          value={preferences.weeklyHours}
                          onChange={(e) => setPreferences({...preferences, weeklyHours: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select hours</option>
                          <option value="0-5">Less than 5 hours</option>
                          <option value="5-10">5-10 hours</option>
                          <option value="10-20">10-20 hours</option>
                          <option value="20+">20+ hours</option>
                        </select>
                      </div>
                      
                      <div className="space-y-6 mb-8">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">AI Learning Assistant</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                              Enable AI recommendations and personalized learning paths
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.aiAssistant}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                aiAssistant: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Personalized Content</h3>
                            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                              Allow AI to suggest courses based on your activity
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.personalizedContent}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                personalizedContent: e.target.checked
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-dark-border peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Preferences'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'billing' && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold">Billing & Subscription</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Manage your subscription and payment methods
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/30 rounded-full mb-8">
                      <div>
                        <h3 className="font-semibold">Current Plan: Free</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                          You're currently on the free plan
                        </p>
                      </div>
                      <button className="btn-primary btn-sm">
                        Upgrade Plan
                      </button>
                    </div>
                    
                    <div className="mb-8">
                      <h3 className="font-semibold mb-4">Payment Methods</h3>
                      <div className="border border-gray-200 dark:border-dark-border rounded-full p-4">
                        <p className="text-center text-light-text-secondary dark:text-dark-text-secondary">
                          No payment methods added
                        </p>
                      </div>
                    </div>
                    
                    <button className="btn-secondary">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'help' && (
                <div className="bg-white dark:bg-dark-card rounded-xl shadow-md">
                  <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                    <h2 className="text-xl font-bold">Help & Support</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary">
                      Get help with any issues or questions
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="card hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-semibold mb-2">Help Center</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                          Browse our knowledge base for answers to common questions
                        </p>
                        <button className="btn-secondary w-full flex items-center justify-center">
                          Visit Help Center <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                      
                      <div className="card hover:shadow-lg transition-all duration-300">
                        <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                          Get personalized help from our support team
                        </p>
                        <button className="btn-secondary w-full flex items-center justify-center">
                          Contact Support <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                    
                    <div className="space-y-4">
                      <div className="border border-gray-200 dark:border-dark-border rounded-full overflow-hidden">
                        <button className="w-full flex items-center justify-between p-4 text-left font-medium">
                          <span>How do I reset my password?</span>
                          <ChevronRight className="w-5 h-5 transform rotate-90" />
                        </button>
                        <div className="px-4 pb-4">
                          <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            You can reset your password by clicking on the "Forgot Password" link on the sign-in page. Follow the instructions sent to your email to create a new password.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-dark-border rounded-full overflow-hidden">
                        <button className="w-full flex items-center justify-between p-4 text-left font-medium">
                          <span>How do I cancel my subscription?</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-dark-border rounded-full overflow-hidden">
                        <button className="w-full flex items-center justify-between p-4 text-left font-medium">
                          <span>Can I download courses for offline viewing?</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="border border-gray-200 dark:border-dark-border rounded-full overflow-hidden">
                        <button className="w-full flex items-center justify-between p-4 text-left font-medium">
                          <span>How do I get a certificate of completion?</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default ProfilePage;