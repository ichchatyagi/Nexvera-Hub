import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileAppBanner from './components/MobileAppBanner';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Courses from './pages/Courses';
import AboutNexvera from './pages/AboutNexvera';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Certifications from './pages/Certifications';
import FreeGuides from './pages/FreeGuides';
import LearningRoadmaps from './pages/LearningRoadmaps';
import CareerSupport from './pages/CareerSupport';
import StudentStories from './pages/StudentStories';
import FAQ from './pages/FAQ';
import FAQDetail from './pages/FAQDetail';
import BlogDetail from './pages/BlogDetail';
import GuideDetail from './pages/GuideDetail';
import Login from './pages/Login';
import CourseDetail from './pages/CourseDetail';
import SignUp from './pages/SignUp';
import { motion, AnimatePresence } from 'framer-motion';
import PageBackground from './components/PageBackground';

import { ConsultationProvider } from './context/ConsultationContext';
import ConsultationModal from './components/ConsultationModal';

const AppContent = () => {
  const location = useLocation();
  const backgroundPages = [
    '/', '/course', '/about', '/blog', '/contact',
    '/certifications', '/free-guides', '/roadmaps',
    '/career-support', '/student-stories', '/faq', '/faq/:slug', '/blog/:id', '/course/:category/:courseSlug', '/guide/:slug'
  ];
  const showBackground = backgroundPages.includes(location.pathname) || location.pathname.startsWith('/blog/') || location.pathname.startsWith('/course/') || location.pathname.startsWith('/guide/') || location.pathname.startsWith('/faq/');
  const showBackgroundActual = showBackground || backgroundPages.some(p => {
    if (p.includes(':')) {
      const base = p.split('/:')[0];
      return location.pathname.startsWith(base);
    }
    return false;
  });

  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-transparent font-sans selection:bg-blue-100 selection:text-blue-900">
      {showBackgroundActual && <PageBackground />}
      {!isAuthPage && <Navbar />}
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/course" element={<Courses />} />
          <Route path="/course/:category/:courseSlug" element={<CourseDetail />} />
          <Route path="/about" element={<AboutNexvera />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/guide/:slug" element={<GuideDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/free-guides" element={<FreeGuides />} />
          <Route path="/roadmaps" element={<LearningRoadmaps />} />
          <Route path="/career-support" element={<CareerSupport />} />
          <Route path="/student-stories" element={<StudentStories />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faq/:slug" element={<FAQDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <MobileAppBanner />}
      {!isAuthPage && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ConsultationProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
        <ConsultationModal />
      </Router>
    </ConsultationProvider>
  );
}


export default App;


