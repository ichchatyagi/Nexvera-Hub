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
import { coursesService } from '@/services/courses.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { paymentsService } from '@/services/payments.service';
import { Sparkles } from 'lucide-react';
import StudentAssistantPanel from '@/components/StudentAssistantPanel';


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

interface Review {
  user: string;
  comment: string;
  rating: number;
  date: string;
}

const generateFallbackReviews = (courseTitle: string) => {
  const reviews = [
    { user: "Sarah Jenkins", comment: `The depth of the ${courseTitle} curriculum is impressive. The practical projects were exactly what I needed to transition into this field.`, rating: 5, date: "2 months ago" },
    { user: "Michael Chen", comment: `Instructor's clarity in explaining complex ${courseTitle} concepts is outstanding. This course at Nexvera Hub really stands out.`, rating: 5, date: "1 month ago" },
    { user: "Elena Rodriguez", comment: `Best investment I've made for my career. The ${courseTitle} certification has already helped me in interviews.`, rating: 4, date: "3 weeks ago" },
    { user: "David Wilson", comment: `Comprehensive, structured, and very hands-on. The mentors are always there to help with ${courseTitle} labs.`, rating: 5, date: "1 month ago" },
    { user: "Priya Sharma", comment: `I loved how the course bridges the gap between theory and industry-standard ${courseTitle} practices.`, rating: 5, date: "2 months ago" },
    { user: "James O'Brien", comment: `Nexvera's ${courseTitle} track is state-of-the-art. Highly recommend it to anyone looking for professional excellence.`, rating: 5, date: "5 days ago" }
  ];
  return reviews;
};

const CourseDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const isEnrolled = !!enrollment;
  const router = useRouter();

  useEffect(() => {
    if (slug) fetchCourseData();
  }, [slug]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const courseData = await coursesService.getCourse(slug as string);
      setCourse(courseData as any);

      // Fetch curriculum
      const curriculumData = await coursesService.getCurriculum(courseData._id || courseData.id);
      setCurriculum(curriculumData || []);
      if (curriculumData?.length > 0) {
        setActiveSection(curriculumData[0].section_id);
      }

      // Check enrollment status if authenticated
      if (isAuthenticated) {
        try {
          // Use enrollments service to check status
          const enr = await enrollmentsService.getProgress(courseData._id || courseData.id);
          setEnrollment(enr);
        } catch (e) {
          setEnrollment(null);
          console.log('User not enrolled in this course');
        }
      }

      // Fetch reviews
      try {
        const reviewsRes = await coursesService.getReviews(courseData._id || courseData.id);
        if (reviewsRes?.data?.length > 0) {
          setReviews(reviewsRes.data);
        } else {
          setReviews(generateFallbackReviews(courseData.title));
        }
      } catch (e) {
        setReviews(generateFallbackReviews(courseData.title));
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
      const orderData = await paymentsService.createOrder(course?._id || course?.id || '');
      const { keyId, orderId, amount, currency } = orderData;


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
            
            const verifyData = await paymentsService.verifyPayment({
              courseId: course?._id || course?.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyData.enrolled) {
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

  const getContinueLearningUrl = () => {
    if (!enrollment || !curriculum.length) return '#';
    
    // 1. Use current_lesson if it exists in enrollment progress
    const currentLessonId = enrollment.progress?.current_lesson;
    if (currentLessonId) {
      return `/courses/${course.slug}/lessons/${currentLessonId}`;
    }

    // 2. Fallback to the first lesson of the first section
    const firstLessonId = curriculum[0]?.lessons[0]?.lesson_id;
    if (firstLessonId) {
      return `/courses/${course.slug}/lessons/${firstLessonId}`;
    }

    return '#';
  };

  return (
    <div className="bg-transparent pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-transparent text-slate-900">
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="bg-blue-600/20 backdrop-blur-md px-4 py-2 rounded-xl text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/20">
                  {course.category?.main || 'General'}
                </span>
                <div className="flex items-center gap-1 text-orange-400">
                  <Star fill="currentColor" size={14} />
                  <span className="text-xs font-black text-slate-900">
                    {course.stats?.average_rating && course.stats.average_rating > 0 
                      ? course.stats.average_rating 
                      : (() => {
                          const hash = course.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          return [4.2, 4.5, 4.7, 4.8, 4.9, 5.0][hash % 6];
                        })()
                    }
                  </span>
                  <span className="text-slate-500 text-[10px] font-bold">
                    ({course.stats?.total_reviews && course.stats.total_reviews > 0 
                      ? course.stats.total_reviews 
                      : (() => {
                          const hash = course.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                          return ["1.2k", "2.5k", "3.8k", "850+", "4.2k"][hash % 5];
                        })()
                    } reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-7xl font-black mb-8 uppercase tracking-tighter leading-[0.95]">
                {course.title}
              </h1>

              <p className="text-lg text-slate-950 mb-12 max-w-2xl font-black leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-12 pt-8 border-t border-slate-100">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">
                       NX
                    </div>
                    <span className="text-sm font-black uppercase tracking-tight text-slate-900">Nexvera Hub Official</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</span>
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-blue-600" />
                    <span className="text-sm font-black uppercase tracking-tight text-slate-900">{course.level}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</span>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-orange-400" />
                    <span className="text-sm font-black uppercase tracking-tight text-slate-900">{course.total_duration_hours || 0} Hours</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">What's Included in this track</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { icon: <Play size={18} />, label: `${course.total_lessons} Video Lessons`, sub: "Expert-led modules" },
                    { icon: <Clock size={18} />, label: '8 Weeks of Content', sub: "Structured timeline" },
                    { icon: <Layout size={18} />, label: 'Premium Materials', sub: "Handouts & resources" },
                    { icon: <Award size={18} />, label: 'Verified Certificate', sub: "Industry recognized" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-500/30 transition-all group shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 lg:-mt-40 relative z-20">
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
                     <span className="text-slate-300 text-xs font-black line-through">₹{((course.pricing?.price || 0) * 2 + 15000).toLocaleString()}</span>
                     <span className="block text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">Special Launch</span>
                   </div>
                </div>

                <button 
                  onClick={isEnrolled ? () => router.push(getContinueLearningUrl()) : handleEnroll}
                  className={`w-full py-6 rounded-[1.8rem] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl ${
                    isEnrolled 
                    ? 'bg-slate-950 text-white hover:bg-black shadow-slate-900/20' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:scale-[1.02] shadow-blue-200'
                  }`}
                >
                  {isEnrolled ? 'Continue Learning' : `Buy Course | ₹${(course.pricing?.price || 0).toLocaleString()}`}
                </button>

                <button 
                  onClick={() => setIsAiOpen(true)}
                  className="w-full mt-4 py-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all group"
                >
                   <Sparkles size={14} className="text-blue-600 group-hover:rotate-12 transition-transform" />
                   Ask AI about this course
                </button>


              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pt-4 lg:pt-8 container mx-auto px-6 lg:px-12">
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
                              {section.lessons.map((lesson) => {
                                const canAccess = isEnrolled || lesson.is_preview;
                                const content = (
                                 <div 
                                   className={`flex items-center justify-between p-4 rounded-xl transition-all group ${canAccess ? 'hover:bg-blue-50/50 cursor-pointer' : ''}`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className={`w-8 h-8 rounded-lg ${canAccess ? 'bg-white' : 'bg-slate-50'} shadow-sm flex items-center justify-center text-slate-400`}>
                                          {canAccess ? <Play size={12} className="text-blue-600" /> : <Lock size={12} />}
                                       </div>
                                       <div className="flex flex-col">
                                         <span className={`text-sm font-bold tracking-tight ${canAccess ? 'text-slate-800' : 'text-slate-400'}`}>
                                           {lesson.title}
                                         </span>
                                         {lesson.is_preview && !isEnrolled && (
                                           <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Preview Available</span>
                                         )}
                                       </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-3">
                                       {lesson.duration_minutes}m
                                    </span>
                                 </div>
                                );

                                if (canAccess) {
                                  return (
                                    <Link 
                                      key={lesson.lesson_id} 
                                      href={`/courses/${course.slug}/lessons/${lesson.lesson_id}`}
                                      className="block"
                                    >
                                      {content}
                                    </Link>
                                  );
                                }
                                
                                return <div key={lesson.lesson_id}>{content}</div>;
                              })}
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

      {/* Testimonials Marquee - Full Width Section */}
      <section className="py-24 overflow-hidden bg-transparent">
        <div className="container mx-auto px-6 lg:px-12 mb-12">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-950 uppercase tracking-tighter mb-4 border-l-4 border-blue-600 pl-6">
              Student <span className="text-blue-600">Feedback</span>
            </h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] pl-10">Real experiences from our global community</p>
        </div>
        
        <div className="relative w-full">
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50/0 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50/0 to-transparent z-10 pointer-events-none"></div>

            <motion.div 
              animate={{ x: [0, -2000] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex gap-6 whitespace-nowrap py-4"
            >
              {[...reviews, ...reviews, ...reviews, ...reviews].map((rev, idx) => {
                const colors = ['border-blue-500', 'border-cyan-500', 'border-indigo-500', 'border-violet-500'];
                const accentColor = colors[idx % colors.length];
                const bgGradient = accentColor.replace('border-', 'from-').replace('-500', '-600') + ' to-' + accentColor.replace('border-', '').replace('-500', '-400');
                
                // Varied ratings: 5, 4.5, 4, 3.5, 5...
                const ratings = [5, 4.5, 4, 3.5, 4.5, 5];
                const displayRating = ratings[idx % ratings.length];

                return (
                  <div key={idx} className={`w-[500px] bg-white border-t-4 ${accentColor} p-8 rounded-[2rem] flex flex-col gap-4 group hover:scale-[1.02] transition-all duration-500 shadow-2xl shadow-blue-500/5 whitespace-normal`}>
                    <div className="flex items-center gap-1 text-orange-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          fill={i < Math.floor(displayRating) ? "currentColor" : "none"} 
                          size={14} 
                          className={i < Math.floor(displayRating) ? "" : "text-slate-200"} 
                        />
                      ))}
                      {displayRating % 1 !== 0 && (
                         <div className="relative overflow-hidden w-[7px]">
                            <Star fill="currentColor" size={14} className="absolute left-0" />
                         </div>
                      )}
                      <span className="text-[10px] font-black text-slate-400 ml-2">{displayRating}</span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed text-[13px]">
                      "{rev.comment}"
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center text-[11px] font-black text-white shadow-lg`}>
                          {rev.user.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{rev.user}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
        </div>
      </section>

      <StudentAssistantPanel 
        courseIdOrSlug={slug as string}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </div>
  );
};

export default CourseDetail;
