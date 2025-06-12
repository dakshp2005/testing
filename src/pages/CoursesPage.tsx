import { useEffect, useState } from 'react';
import { BookOpen, Clock, Star } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import SearchBar from '../components/search/SearchBar';
import FilterBar from '../components/search/FilterBar';
import { useSearchFilter } from '../hooks/useSearchFilter';

function CoursesPage() {
  const [courses] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Master the basics of JavaScript programming',
      image: 'https://images.pexels.com/photos/7014337/pexels-photo-7014337.jpeg',
      progress: 40,
      totalLessons: 14,
      timeLeft: '3 hours',
      rating: 4.8,
      reviews: 128,
      level: 'beginner',
      category: 'javascript',
      tags: ['JavaScript', 'Web Development']
    },
    {
      id: 2,
      title: 'Java Programming Masterclass',
      description: 'Learn Java programming from scratch',
      image: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg',
      progress: 0,
      totalLessons: 20,
      timeLeft: '10 hours',
      rating: 4.9,
      reviews: 256,
      level: 'intermediate',
      category: 'java',
      tags: ['Java', 'OOP']
    },
    // Add more courses...
  ]);

  const filteredCourses = useSearchFilter(courses, ['title', 'description', 'tags']);

  useEffect(() => {
    document.title = 'Courses | LearnFlow';
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-light-text-secondary dark:text-dark-text-secondary">
          Continue learning and track your progress
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <SearchBar placeholder="Search courses..." />
        <FilterBar 
          options={{
            levels: ['beginner', 'intermediate', 'advanced'],
            categories: ['javascript', 'java', 'python', 'web'],
            sortOptions: ['rating', 'newest', 'popular']
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="card hover:shadow-lg transition-all duration-300">
            <div className="relative mb-4">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <div className="absolute top-3 right-3 bg-white dark:bg-dark-card px-2 py-1 rounded-md text-xs font-medium">
                {course.progress}% Complete
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm mb-3">
              {course.description}
            </p>
            
            <div className="flex items-center text-light-text-secondary dark:text-dark-text-secondary text-sm mb-3">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>{course.totalLessons} lessons</span>
              <span className="mx-2">•</span>
              <Clock className="w-4 h-4 mr-1" />
              <span>{course.timeLeft} left</span>
            </div>
            
            <div className="flex items-center text-sm mb-4">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="font-medium">{course.rating}</span>
              <span className="text-light-text-secondary dark:text-dark-text-secondary ml-1">
                ({course.reviews} reviews)
              </span>
            </div>
            
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full rounded-full" 
                  style={{width: `${course.progress}%`}}
                ></div>
              </div>
            </div>
            
            <button className="btn-primary w-full">
              {course.progress > 0 ? 'Continue Learning' : 'Start Course'}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default CoursesPage;