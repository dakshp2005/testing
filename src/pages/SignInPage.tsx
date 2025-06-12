import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, Github, Linkedin, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from "sonner";

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/learn';

  useEffect(() => {
    // Set page title
    document.title = 'Sign In | LearnFlow';
    
    // If already authenticated, redirect to the dashboard
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      toast.success("Sign in successful!");
      // redirect handled by useEffect
    } catch (err: any) {
      const errorMessage = err?.message || "Sign in failed!";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg flex flex-row p-0">
      {/* Left: Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center mb-6">
              <Brain className="w-8 h-8 text-primary-500 mr-2" />
              <span className="text-2xl font-bold">LearnFlow</span>
            </Link>
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary">
              Sign in to continue your learning journey
            </p>
          </div>
          
          {/* Form */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl p-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Your Email"
                    required
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-dark-border rounded-full bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500 text-md tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Remember Me */}
              <div className="flex items-center mb-6">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded-full focus:ring-primary-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm">
                  Remember me
                </label>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex justify-center items-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200 dark:border-dark-border"></div>
              <span className="flex-shrink mx-4 text-light-text-secondary dark:text-dark-text-secondary text-sm">
                or continue with
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-dark-border"></div>
            </div>
            
            {/* Social Logins */}
            <div className="grid grid-cols-3 gap-3">
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-dark-border rounded-full hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                <Mail className="w-5 h-5" />
              </button>
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-dark-border rounded-full hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                <Github className="w-5 h-5" />
              </button>
              <button className="flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-dark-border rounded-full hover:bg-gray-50 dark:hover:bg-dark-border transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Sign Up Link */}
          <p className="text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-600 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
      {/* Right: Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-primary-100 dark:bg-dark-card h-full">
        <img
          src="/assets/signin-illustration.svg"
          alt="Sign In Illustration"
          className="max-w-[80%] max-h-[80%] object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

export default SignInPage;