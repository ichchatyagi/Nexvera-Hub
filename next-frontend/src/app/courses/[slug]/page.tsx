"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Layout, 
  Users, 
  Award, 
  Star, 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  Calendar,
  Lock
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Lesson {
  lesson_id: string;
  title: string;
  duration_minutes: number;
  type: string;
  is_preview: boolean;
}

interface Section {
  section_id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  _id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  category: {
    main: string;
    sub: string;
  };
  pricing: {
    price: number;
    currency: string;
  };
  stats: {
    average_rating: number;
    total_reviews: number;
  };
  level: string;
  thumbnail_url: string;
  total_lessons: number;
  total_duration_hours: number;
}

const CourseDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (slug) fetchCourseData();
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const courseRes = await api.get(`/courses/${slug}`); // Backend should handle lookup by slug
      const courseData = courseRes.data;
      setCourse(courseData);

      // Fetch curriculum
      const curriculumRes = await api.get(`/courses/${courseData._id || courseData.id}/curriculum`);
      setCurriculum(curriculumRes.data || []);
      if (curriculumRes.data?.length > 0) {
        setActiveSection(curriculumRes.data[0].section_id);
      }

      // Check enrollment status if authenticated
      if (isAuthenticated) {
        try {
          // Use progress endpoint to check enrollment
          const progressRes = await api.get(`/courses/${courseData._id || courseData.id}/progress`);
          // If the request succeeds, the user is enrolled
          setIsEnrolled(true);
        } catch (e) {
          // If 403/404, user is likely not enrolled
          setIsEnrolled(false);
          console.log('User not enrolled in this course');
        }
      }
    } catch (error) {
      toast.error('Failed to load course details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${slug}`);
      return;
    }

    try {
      toast.loading('Initializing checkout...', { id: 'payment' });
      
      // 1. Create Razorpay Order via Backend
      const orderRes = await api.post('/payments/order', { courseId: course?._id || course?.id });
      const { keyId, orderId, amount, currency } = orderRes.data;

      // 2. Load Razorpay script dynamically
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      // 3. Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Nexvera Hub',
        description: `Course: ${course?.title}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            toast.loading('Verifying payment...', { id: 'payment' });
            
            const verifyRes = await api.post('/payments/verify', {
              courseId: course?._id || course?.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.enrolled) {
              setIsEnrolled(true);
              toast.success('Course purchased successfully!', { id: 'payment' });
              // Refresh to unlock lessons
              fetchCourseData();
            } else {
              toast.error('Payment verification failed', { id: 'payment' });
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed', { id: 'payment' });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#2563eb', // blue-600
        },
        modal: {
          ondismiss: () => {
            toast.dismiss('payment');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`, { id: 'payment' });
      });

      rzp.open();
      toast.dismiss('payment');
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast.error(error.response?.data?.message || 'Failed to start purchase flow', { id: 'payment' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Course Not Found</h2>
          <Link href="/courses" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-40 overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600 to-transparent blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="bg-blue-600/20 backdrop-blur-md px-4 py-2 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                  {course.category?.main || 'General'}
                </span>
                <div className="flex items-center gap-1 text-orange-400">
                  <Star fill="currentColor" size={14} />
                  <span className="text-xs font-black text-white">{course.stats?.average_rating || 'New'}</span>
                  <span className="text-white/40 text-[10px] font-bold">({course.stats?.total_reviews || 0} reviews)</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-7xl font-black mb-8 uppercase tracking-tighter leading-[0.95]">
                {course.title}
              </h1>

              <p className="text-lg text-white/60 mb-12 max-w-2xl font-medium leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-12 pt-8 border-t border-white/10">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Provider</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">
                       NX
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight">Nexvera Hub Official</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Level</span>
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-cyan-400" />
                    <span className="text-sm font-bold uppercase tracking-tight">{course.level}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Duration</span>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-orange-400" />
                    <span className="text-sm font-bold uppercase tracking-tight">{course.total_duration_hours || 0} Hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 lg:-mb-64 relative z-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl p-8 sticky top-32"
              >
                <div className="relative h-56 rounded-[2rem] overflow-hidden mb-8 shadow-xl shadow-blue-500/10">
                  {course.thumbnail_url ? (
                    <Image 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white/20">
                       <BookOpen size={64} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-10">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                       <Play fill="currentColor" size={24} className="ml-1" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Access</p>
                      <p className="text-3xl font-black text-slate-950 tracking-tighter">₹{(course.pricing?.price || 0).toLocaleString()}</p>
                    </div>
                   <div className="text-right">
                     <span className="text-slate-300 text-xs font-black line-through">₹2,999</span>
                     <span className="block text-green-500 text-[10px] font-black uppercase tracking-widest mt-1">Special Launch</span>
                   </div>
                </div>

                <button 
                  onClick={isEnrolled ? () => router.push(`/courses/${course._id || course.id}/lessons/${curriculum[0]?.lessons[0]?.lesson_id}`) : handleEnroll}
                  className={`w-full py-6 rounded-[1.8rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl ${
                    isEnrolled 
                    ? 'bg-slate-950 text-white hover:bg-black shadow-slate-900/20' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] shadow-blue-200'
                  }`}
                >
                  {isEnrolled ? 'Continue Learning' : `Buy Course | ₹${(course.pricing?.price || 0).toLocaleString()}`}
                </button>

                <div className="mt-10 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">What's Included</h4>
                  <ul className="space-y-4">
                    {[
                      { icon: <Play size={14} />, label: `${course.total_lessons} Video Lessons` },
                      { icon: <Clock size={14} />, label: '8 Weeks of Content' },
                      { icon: <Layout size={14} />, label: 'Premium Study Materials' },
                      { icon: <Award size={14} />, label: 'Verified Certificate' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-[11px] uppercase tracking-wide">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          {item.icon}
                        </div>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pt-32 lg:pt-48 container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <div className="mb-20">
              <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-blue-600 pl-6">
                Course <span className="text-blue-600">Curriculum</span>
              </h2>
              
              <div className="space-y-4">
                {curriculum.map((section) => (
                  <div key={section.section_id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setActiveSection(activeSection === section.section_id ? null : section.section_id)}
                      className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-colors text-left outline-none"
                    >
                      <div className="flex items-center gap-6">
                         <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            {curriculum.indexOf(section) + 1}
                         </div>
                         <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-lg">{section.title}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                                {section.lessons.length} Modules • {section.lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0)} Min
                             </p>
                         </div>
                      </div>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform ${activeSection === section.section_id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeSection === section.section_id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-slate-100"
                        >
                          <div className="p-4 space-y-2">
                              {section.lessons.map((lesson) => (
                               <div 
                                 key={lesson.lesson_id}
                                 className="flex items-center justify-between p-4 rounded-xl hover:bg-blue-50/50 transition-all group"
                               >
                                  <div className="flex items-center gap-4">
                                     <div className={`w-8 h-8 rounded-lg ${isEnrolled ? 'bg-white' : 'bg-slate-50'} shadow-sm flex items-center justify-center text-slate-400`}>
                                        {isEnrolled ? <Play size={12} className="text-blue-600" /> : <Lock size={12} />}
                                     </div>
                                     <span className={`text-sm font-bold tracking-tight ${isEnrolled ? 'text-slate-800' : 'text-slate-400'}`}>
                                       {lesson.title}
                                     </span>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-3">
                                     {lesson.duration_minutes}m
                                  </span>
                               </div>
                             ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-20">
                 <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-8 border-l-4 border-cyan-400 pl-6">
                   Academic <span className="text-cyan-500">Mentorship</span>
                 </h2>
                 <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row gap-10 items-center md:items-start shadow-sm">
                    <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-1 shrink-0 overflow-hidden shadow-2xl">
                       <div className="w-full h-full bg-white rounded-[2.3rem] flex items-center justify-center text-blue-600 text-6xl font-black">
                         NX
                       </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">
                         Nexvera Hub Expert
                       </h4>
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 block">Nexvera Academic Faculty</span>
                       <p className="text-base text-slate-500 leading-relaxed font-medium">
                          This course is delivered by Nexvera's elite faculty. Our instructors are industry veterans chosen for their technical expertise and pedagogical excellence.
                       </p>
                    </div>
                 </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
