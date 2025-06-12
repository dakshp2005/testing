import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { RainbowButton } from '../components/ui/rainbow-button';
import { Link } from 'react-router-dom';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-500">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-24">
        <h1 className="text-4xl font-bold mb-4 text-[#5164E1] dark:text-[#A7D1F1]">Features</h1>
        <p className="text-lg text-gray-500 dark:text-gray-300 max-w-xl text-center mb-10">
          Discover all the AI-powered features and collaborative tools that make LearnFlow unique.
        </p>
        <Link to="/signup">
          <RainbowButton className="text-white dark:text-black transition-shadow duration-500 shadow-lg hover:shadow-2xl hover:scale-105">
            Start Learning Free
          </RainbowButton>
        </Link>
      </main>
      <Footer />
    </div>
  );
}