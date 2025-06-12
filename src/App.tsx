import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CommunityPage from './pages/CommunityPage';
import CommunityDetailsPage from './pages/CommunityDetailsPage';
import CoursesPage from './pages/CoursesPage';
import ExploreResourcesPage from './pages/ExploreResourcesPage';
import AILearningPage from './pages/AILearningPage';
import PortfolioPage from './pages/PortfolioPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminAddResourcePage from './pages/AdminAddResourcePage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/admin/AdminRoute';
import { useTheme } from './context/ThemeContext';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AboutPage from './pages/AboutPage';
import { Toaster } from "sonner";

function App() {
  const { theme } = useTheme();
  
  return (
    <div className={theme}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Protected Routes */}
        <Route path="/learn" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/learn/explore" element={
          <ProtectedRoute>
            <ExploreResourcesPage />
          </ProtectedRoute>
        } />
        <Route path="/learn/ai" element={
          <ProtectedRoute>
            <AILearningPage />
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        } />
        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        } />
        <Route path="/community/:id" element={
          <ProtectedRoute>
            <CommunityDetailsPage />
          </ProtectedRoute>
        } />
        <Route path="/portfolio" element={
          <ProtectedRoute>
            <PortfolioPage />
          </ProtectedRoute>
        } />
        <Route path="/portfolio/:userId" element={
          <ProtectedRoute>
            <PortfolioPage />
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <AchievementsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/resources" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminResourcesPage />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/resources/add" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminAddResourcePage />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/admin/resources/edit/:id" element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminAddResourcePage />
            </AdminRoute>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="bottom-center" richColors />
    </div>
  );
}

export default App;