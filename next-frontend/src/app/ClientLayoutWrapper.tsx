"use client";

import React from 'react';
import { usePathname } from "next/navigation";
import { ConsultationProvider } from "../context/ConsultationContext";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileAppBanner from "../components/MobileAppBanner";
import ScrollToTop from "../components/ScrollToTop";
import PageBackground from "../components/PageBackground";
import ConsultationModal from "../components/ConsultationModal";
import TuitionPromo from "../components/TuitionPromo";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const backgroundPages = [
    '/', '/course', '/about', '/blog', '/contact',
    '/certifications', '/free-guides', '/roadmaps',
    '/career-support', '/student-stories', '/faq', '/our-educators'
  ];

  const showBackground = backgroundPages.includes(pathname) || 
                         pathname.startsWith('/blog/') || 
                         pathname.startsWith('/course/') || 
                         pathname.startsWith('/guide/') || 
                         pathname.startsWith('/faq/');

  const isAuthPage = ['/login', '/register'].includes(pathname);
  const isCourseDetailPage = pathname.startsWith('/course/') && pathname.split('/').filter(Boolean).length >= 3;

  return (
    <AuthProvider>
      <ConsultationProvider>
        <Toaster position="top-right" />
        <ScrollToTop />
        <div className="relative min-h-screen bg-transparent font-sans selection:bg-blue-100 selection:text-blue-900">
          {showBackground && <PageBackground />}
          {!isAuthPage && <Navbar />}
          <main className="relative z-10">{children}</main>
          {!isAuthPage && !isCourseDetailPage && <MobileAppBanner />}
          {!isAuthPage && !isCourseDetailPage && <Footer />}
          <ConsultationModal />
          <TuitionPromo />
        </div>
      </ConsultationProvider>
    </AuthProvider>
  );
}
