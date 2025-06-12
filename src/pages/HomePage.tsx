import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Brain, Code, Award, Users, ChevronRight, Play } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { RainbowButton } from '../components/ui/rainbow-button';
import { TextShimmer } from '../components/ui/text-shimmer';

function HomePage() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = "LearnFlow | AI-Powered Learning Platform";
  }, []);

  const handleFeatureClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      window.location.href = '/signup';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-500">
      <Header />

      {/* Hero Section */}
      <section className="pt-36 pb-24">
        <div className="container max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <h1 className="mb-8 leading-tight">
              <TextShimmer
                as="span"
                duration={1.8}
                className="text-5xl font-semibold block [--base-color:theme(colors.blue.600)] [--base-gradient-color:theme(colors.blue.200)] dark:[--base-color:theme(colors.blue.300)] dark:[--base-gradient-color:theme(colors.blue.100)]"
              >
                Learn. Build. Grow. Together.
              </TextShimmer>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-300 mb-12 max-w-xl">
              Master tech skills with AI-powered education and real-world collaboration.
            </p>
            <div className="flex gap-4 mb-12">
              {isAuthenticated ? (
                <Link
                  to="/learn"
                  className="block"
                >
                  <RainbowButton className="text-white dark:text-black transition-shadow duration-500 ease-[cubic-bezier(.4,0,.2,1)] shadow-lg hover:shadow-2xl hover:scale-105 rainbow-glow">
                    Dashboard
                  </RainbowButton>
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="block"
                >
                  <RainbowButton className="text-white dark:text-black transition-shadow duration-500 ease-[cubic-bezier(.4,0,.2,1)] shadow-lg hover:shadow-2xl hover:scale-105 rainbow-glow">
                    Start Learning Free
                  </RainbowButton>
                </Link>
              )}
              <button
                className="text-[#5164E1] dark:text-[#5164E1] bg-white/80 dark:bg-zinc-900/80 border border-[#A7D1F1] px-6 py-2 rounded-xl text-base font-medium flex items-center gap-2 transition-shadow duration-500 ease-[cubic-bezier(.4,0,.2,1)] shadow-lg hover:shadow-2xl hover:scale-105"
                style={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              >
                <Play className="w-5 h-5" /> Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-400 dark:text-gray-400">Trusted by learners from</span>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Google</span>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Meta</span>
              <span className="text-base font-semibold text-gray-700 dark:text-gray-200">Netflix</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <img
              src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Diverse learners collaborating"
              className="rounded-2xl shadow-md border border-gray-200 dark:border-neutral-800 w-full max-w-md object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-gray-100 dark:border-neutral-800">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Supercharge Your Learning</h2>
            <p className="text-lg text-gray-500 dark:text-gray-300">
              AI-powered learning, real-world projects, and a supportive community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-tile flex flex-col justify-between items-start gap-6 p-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl min-h-[320px] h-full">
              <Brain className="w-8 h-8 text-[#5164E1]" />
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Personal AI Tutor</h3>
                <p className="text-gray-500 dark:text-gray-300 mb-4">
                  Instant answers, personalized paths, and adaptive explanations.
                </p>
                <Link
                  to={isAuthenticated ? "/learn" : "/signup"}
                  onClick={handleFeatureClick}
                  className="flex items-center font-medium hover:underline"
                  style={{ color: '#5164E1' }}
                >
                  Try AI Assistant <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="glass-tile flex flex-col justify-between items-start gap-6 p-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl min-h-[320px] h-full">
              <Code className="w-8 h-8 text-[#5164E1]" />
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Real-World Projects</h3>
                <p className="text-gray-500 dark:text-gray-300 mb-4">
                  Build portfolio-worthy projects with mentorship and teams.
                </p>
                <Link
                  to={isAuthenticated ? "/projects" : "/signup"}
                  onClick={handleFeatureClick}
                  className="flex items-center font-medium hover:underline"
                  style={{ color: '#5164E1' }}
                >
                  Browse Projects <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="glass-tile flex flex-col justify-between items-start gap-6 p-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl min-h-[320px] h-full">
              <Award className="w-8 h-8 text-[#5164E1]" />
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Industry Certificates</h3>
                <p className="text-gray-500 dark:text-gray-300 mb-4">
                  Earn certificates and build a portfolio that showcases your expertise.
                </p>
                <Link
                  to={isAuthenticated ? "/portfolio" : "/signup"}
                  onClick={handleFeatureClick}
                  className="flex items-center font-medium hover:underline"
                  style={{ color: '#5164E1' }}
                >
                  View Certificates <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Feature 4 */}
            <div className="glass-tile flex flex-col justify-between items-start gap-6 p-8 rounded-2xl shadow-xl transition-transform duration-300 hover:scale-105 hover:shadow-2xl min-h-[320px] h-full">
              <Users className="w-8 h-8 text-[#5164E1]" />
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Expert Community</h3>
                <p className="text-gray-500 dark:text-gray-300 mb-4">
                  Connect with mentors, join study groups, and get feedback.
                </p>
                <Link
                  to={isAuthenticated ? "/community" : "/signup"}
                  onClick={handleFeatureClick}
                  className="flex items-center font-medium hover:underline"
                  style={{ color: '#5164E1' }}
                >
                  Join Community <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-t border-gray-100">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">Loved by Learners Worldwide</h2>
            <p className="text-lg text-gray-500 dark:text-gray-300">
              Join thousands who have transformed their careers with LearnFlow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">50K+</h3>
              <p className="text-gray-500 dark:text-gray-400">Active Students</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">95%</h3>
              <p className="text-gray-500 dark:text-gray-400">Completion Rate</p>
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">40%</h3>
              <p className="text-gray-500 dark:text-gray-400">Avg. Salary Increase</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Alex Johnson" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200">Alex Johnson</h4>
                  <p className="text-gray-400 dark:text-gray-400 text-sm">Frontend Developer at Google</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-base">
                "LearnFlow's AI tutor helped me understand complex React concepts. The project-based approach prepared me for real-world challenges."
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Sarah Chen" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200">Sarah Chen</h4>
                  <p className="text-gray-400 dark:text-gray-400 text-sm">Data Scientist at Netflix</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-base">
                "The data science track was comprehensive and the community support was incredible. I landed my dream job within 3 months."
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <img src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Michael Obi" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-200">Michael Obi</h4>
                  <p className="text-gray-400 dark:text-gray-400 text-sm">Full Stack Developer at Meta</p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-base">
                "I switched careers from finance to tech using LearnFlow. The structured paths and hands-on projects gave me confidence."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-gray-100">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-6 text-gray-900 dark:text-white">Ready to Start?</h2>
          <p className="text-lg text-gray-500 dark:text-gray-300 mb-10">
            Join thousands of learners and start building your skills today.
          </p>
          <Link
            to={isAuthenticated ? "/learn" : "/signup"}
            className="block w-fit mx-auto mt-10"
          >
            <RainbowButton className="text-white dark:text-black transition-shadow duration-500 ease-[cubic-bezier(.4,0,.2,1)] shadow-lg hover:shadow-2xl hover:scale-105">
              {isAuthenticated ? "Go to Dashboard" : "Get Started For Free"}
            </RainbowButton>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomePage;