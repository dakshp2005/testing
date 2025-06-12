import { useEffect } from 'react';
import { BookOpen, Clock, Award, ArrowRight, Users, Brain, Code } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { RainbowButton } from '../components/ui/rainbow-button';
import { TextShimmer } from '../components/ui/text-shimmer';
import { motion } from "framer-motion";

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Dashboard | LearnFlow';
  }, []);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 leading-tight">
          <TextShimmer
            as="span"
            duration={1.8}
            className="text-5xl font-semibold block [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.200)] dark:[--base-color:theme(colors.blue.300)] dark:[--base-gradient-color:theme(colors.blue.100)]"
          >
            {`Welcome back, ${user?.user_metadata?.name || "Learner"}!`}
          </TextShimmer>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-300 mb-8 max-w-xl mx-auto">
          Continue your learning journey today.
        </p>
        <RainbowButton
          className="text-white dark:text-black transition-shadow duration-500 shadow-lg hover:shadow-2xl hover:scale-105"
          onClick={() => navigate('/learn/explore')}
        >
          Explore Resources
        </RainbowButton>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            to: "/projects",
            icon: <Code className="w-6 h-6 text-white" />,
            label: "Create Project"
          },
          {
            to: "/community",
            icon: <Users className="w-6 h-6 text-white" />,
            label: "Explore Community"
          },
          {
            to: "/learn/ai",
            icon: <Brain className="w-6 h-6 text-white" />,
            label: "Learn with AI"
          }
        ].map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.1 }}
          >
            <Link 
              to={item.to}
              className="group bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center gap-3 border border-gray-100 dark:border-neutral-800"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-[#5164E1] dark:group-hover:text-[#A7D1F1] transition-colors">{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: "Learning Streak",
            icon: <Award className="w-6 h-6 text-white" />,
            value: "5 days",
            desc: "Keep it up!"
          },
          {
            title: "Hours Learned",
            icon: <Clock className="w-6 h-6 text-white" />,
            value: "12.5",
            desc: "This week"
          },
          {
            title: "Courses",
            icon: <BookOpen className="w-6 h-6 text-white" />,
            value: "3",
            desc: "In progress"
          }
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#5164E1] dark:text-[#A7D1F1]">{stat.title}</h3>
              <div className="w-12 h-12 bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] rounded-xl flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-gray-400 dark:text-gray-500 mt-1">{stat.desc}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Continue Learning Section */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[#5164E1] dark:text-[#A7D1F1]">Continue Learning</h2>
          <button className="text-[#5164E1] dark:text-[#A7D1F1] hover:underline flex items-center transition-colors">
            View all courses <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: "JavaScript Fundamentals",
              module: "Module 3: Functions & Objects",
              progress: 40,
              icon: <BookOpen className="w-8 h-8 text-white" />
            },
            {
              title: "React Essentials",
              module: "Module 2: Components & Props",
              progress: 25,
              icon: <BookOpen className="w-8 h-8 text-white" />
            }
          ].map((course, i) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-[#5164E1] dark:text-[#A7D1F1]">{course.title}</h3>
                  <p className="text-gray-400 dark:text-gray-500">
                    {course.module}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] flex items-center justify-center">
                  {course.icon}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="text-[#5164E1] dark:text-[#A7D1F1]">{course.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#5164E1] to-[#A7D1F1] h-full rounded-full" style={{width: `${course.progress}%`}}></div>
                </div>
              </div>
              
              <RainbowButton className="w-full text-white dark:text-black transition-shadow duration-500 shadow-lg hover:shadow-2xl hover:scale-105">
                Continue Learning
              </RainbowButton>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Recent Achievements */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-[#5164E1] dark:text-[#A7D1F1]">Recent Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "5-Day Streak",
              desc: "You've been learning consistently for 5 days!",
              icon: <Award className="w-8 h-8 text-white" />
            },
            {
              title: "First Project",
              desc: "Completed your first coding project",
              icon: <Award className="w-8 h-8 text-white" />
            },
            {
              title: "JavaScript Basics",
              desc: "Completed JavaScript Fundamentals Module 1",
              icon: <Award className="w-8 h-8 text-white" />
            }
          ].map((ach, i) => (
            <motion.div
              key={ach.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.1 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-neutral-800"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#5164E1] to-[#A7D1F1] rounded-xl flex items-center justify-center mb-6">
                {ach.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#5164E1] dark:text-[#A7D1F1]">{ach.title}</h3>
              <p className="text-gray-400 dark:text-gray-500">
                {ach.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;