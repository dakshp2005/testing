import { Link } from 'react-router-dom';
import { Brain, Twitter, Facebook, Instagram, Linkedin, Github } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 dark:bg-dark-card border-t border-gray-200 dark:border-dark-border pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Brain className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold">LearnFlow</span>
            </Link>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 max-w-md">
              An AI-powered learning platform helping students master tech skills through personalized education and real-world collaboration.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-500 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-500 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-200 dark:border-dark-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h4 className="font-semibold text-lg mb-2">Stay updated</h4>
              <p className="text-light-text-secondary dark:text-dark-text-secondary">
                Subscribe to our newsletter for the latest updates
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-64 px-4 py-2 rounded-l-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="btn-primary rounded-l-none rounded-r-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-dark-border mt-8 pt-8 text-center">
          <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
            © {currentYear} LearnFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;