"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X, User, LogOut, LayoutDashboard, Search, Loader2, Bell } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useNotifications } from '@/context/NotificationsContext';


const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer outline-none">
                {title}
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white/90 backdrop-blur-xl border border-blue-50 rounded-2xl shadow-xl shadow-blue-500/10 p-2 z-[60]"
                    >
                        {items.map((item, idx) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={idx}
                                    href={item.path}
                                    className={`
                                        block px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}
                                    `}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MobileNavDropdown = ({ title, items, closeMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex flex-col border-b border-slate-100 last:border-none">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-4 text-slate-800 font-bold text-lg hover:text-blue-600 outline-none transition-colors"
            >
                {title}
                <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="flex flex-col gap-3 pb-4 pl-4 border-l-2 border-blue-100 ml-2">
                            {items.map((item, idx) => {
                                const isActive = pathname === item.path;
                                return (
                                    <Link
                                        key={idx}
                                        href={item.path}
                                        onClick={closeMenu}
                                        className={`
                                            block text-[15px] font-medium transition-all
                                            ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'}
                                        `}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'EU', name: 'Europe' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'SG', name: 'Singapore' },
    { code: 'AE', name: 'UAE' },
    { code: 'ZA', name: 'South Africa' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'KR', name: 'South Korea' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'IE', name: 'Ireland' },
    { code: 'IL', name: 'Israel' },
];

const CountryDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="flex items-center gap-1.5 px-2 py-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors focus:outline-none rounded-xl hover:bg-slate-50">
                <span className="hidden sm:inline-block text-xs font-semibold">{selectedCountry.name}</span>
                <span className="flex items-center">
                    <img
                        src={`https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`}
                        alt={selectedCountry.name}
                        className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm"
                    />
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-blue-50 rounded-2xl shadow-xl shadow-blue-500/10 p-2 z-[60] max-h-[170px] overflow-y-auto custom-scrollbar"
                    >
                        {countries.map((country) => (
                            <button
                                key={country.code}
                                onClick={() => {
                                    setSelectedCountry(country);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left mb-1 last:mb-0
                                    ${selectedCountry.code === country.code ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}
                                `}
                            >
                                <span className="text-xs font-semibold">{country.name}</span>
                                <span className="flex items-center">
                                    <img
                                        src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
                                        alt={country.name}
                                        className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm"
                                    />
                                </span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { notifications, unreadCount, isOpen: isNotificationsOpen, toggle: toggleNotifications, close: closeNotifications, markRead, markAllRead } = useNotifications();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchError, setSearchError] = useState(false);
    const reqIdRef = useRef(0);

    useEffect(() => {
        const query = searchQuery.trim();
        if (query.length < 2) {
            setSuggestions(null);
            setShowSuggestions(false);
            return;
        }

        const debounceTimer = setTimeout(async () => {
            const requestId = ++reqIdRef.current;
            setIsSearching(true);
            setSearchError(false);
            try {
                const response = await api.get('/search/suggest', {
                    params: { q: query.slice(0, 64) }
                });
                if (requestId === reqIdRef.current) {
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                }
            } catch (err) {
                if (requestId === reqIdRef.current) {
                    console.error('Search error:', err);
                    setSearchError(true);
                    setShowSuggestions(true);
                }
            } finally {
                if (requestId === reqIdRef.current) {
                    setIsSearching(false);
                }
            }
        }, 250);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Close suggestions on route change or click outside
    useEffect(() => {
        setShowSuggestions(false);
        setSearchQuery('');
        closeNotifications();
    }, [pathname, closeNotifications]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowSuggestions(false);
                closeNotifications();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeNotifications]);

    const handleNotificationClick = async (notif: any) => {
        await markRead(notif._id);
        if (notif.data?.liveClassId && notif.type === 'live_class_started') {
            router.push(`/live-classes/${notif.data.liveClassId}/join`);
        } else if (notif.data?.courseId && (notif.type === 'payment_confirmed' || notif.type === 'enrollment_granted')) {
            router.push(`/courses/${notif.data.courseId}`);
        } else if (notif.type === 'live_class_recording_available' && notif.data?.liveClassId) {
            router.push(`/live-classes/${notif.data.liveClassId}/recording`);
        }
        closeNotifications();
    };

    const renderNotificationsDropdown = () => {
        if (!isNotificationsOpen) return null;

        return (
            <AnimatePresence>
                <div className="fixed inset-0 z-40" onClick={() => closeNotifications()}></div>
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 flex flex-col max-h-[80vh]"
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 mb-2">
                        <span className="font-bold text-slate-800">Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer outline-none">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-slate-400 text-sm font-semibold">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notif) => (
                                <button
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`w-full text-left p-3 rounded-xl transition-colors flex flex-col gap-1 outline-none ${notif.read_at === null ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="text-sm font-bold text-slate-800 line-clamp-1">{notif.title}</div>
                                    <div className="text-xs text-slate-600 line-clamp-2">{notif.body}</div>
                                    <div className="text-[10px] text-slate-400 font-semibold mt-1">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                    {/* View all footer */}
                    <div className="border-t border-slate-50 mt-2 pt-2 px-2">
                        <Link
                            href="/notifications"
                            onClick={() => closeNotifications()}
                            className="flex items-center justify-center w-full py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                            View all notifications →
                        </Link>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            router.push(`/courses?search=${encodeURIComponent(q)}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: any) => {
        setShowSuggestions(false);
        setSearchQuery('');
        if (suggestion.type === 'course') {
            router.push(`/courses/${suggestion.slug}`);
        } else if (suggestion.type === 'tuition_class') {
            router.push(`/tuition/${suggestion.slug}`);
        } else if (suggestion.type === 'tuition_subject') {
            router.push(`/tuition/${suggestion.classSlug}/${suggestion.subjectSlug}`);
        }
    };

    const aboutItems = [
        { label: 'About Nexvera', path: '/about' },
        { label: 'Certifications', path: '/certifications' }
    ];

    const resourceItems = [
        { label: 'Blog', path: '/blog' },
        { label: 'Our Educators', path: '/our-educators' },
        { label: 'Free Guides', path: '/free-guides' },
        { label: 'Learning Roadmaps', path: '/roadmaps' }
    ];


    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const renderSearchDropdown = () => {
        if (!showSuggestions) return null;

        const hasCourses = suggestions?.courses?.length > 0;
        const hasTuitionClasses = suggestions?.tuition_classes?.length > 0;
        const hasTuitionSubjects = suggestions?.tuition_subjects?.length > 0;
        const noResults = !hasCourses && !hasTuitionClasses && !hasTuitionSubjects && !isSearching;

        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto">
                {isSearching && (
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 text-slate-400">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-sm font-bold uppercase tracking-widest">Searching...</span>
                    </div>
                )}

                {searchError && (
                    <div className="px-6 py-4 text-red-500 text-sm font-bold uppercase tracking-widest text-center">
                        Search unavailable
                    </div>
                )}

                {!isSearching && noResults && (
                    <div className="px-6 py-6 text-slate-400 text-sm font-bold uppercase tracking-widest text-center">
                        No matches found
                    </div>
                )}

                {/* Courses */}
                {hasCourses && (
                    <div className="p-2 border-b border-slate-50">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Courses</div>
                        {suggestions.courses.map((c: any) => (
                            <button
                                key={c.id}
                                onClick={() => handleSuggestionClick(c)}
                                className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex-shrink-0 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Search size={14} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{c.title}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.category_main} • {c.level}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Tuition Classes */}
                {hasTuitionClasses && (
                    <div className="p-2 border-b border-slate-50">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tuition Classes</div>
                        {suggestions.tuition_classes.map((tc: any) => (
                            <button
                                key={tc.id}
                                onClick={() => handleSuggestionClick(tc)}
                                className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-cyan-50 flex-shrink-0 flex items-center justify-center text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                                    <Search size={14} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-cyan-600 transition-colors uppercase tracking-tight">{tc.title}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Class {tc.class_level}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Tuition Subjects */}
                {hasTuitionSubjects && (
                    <div className="p-2 border-b border-slate-50">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tuition Subjects</div>
                        {suggestions.tuition_subjects.map((ts: any) => (
                            <button
                                key={ts.subjectId}
                                onClick={() => handleSuggestionClick(ts)}
                                className="w-full text-left px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-violet-50 flex-shrink-0 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                    <Search size={14} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{ts.subjectName}</div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">in {ts.classTitle} (Level {ts.class_level})</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Default Actions */}
                <div className="p-2 bg-slate-50/50 mt-1">
                    <Link
                        href={`/courses?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-blue-600 group"
                    >
                        <ChevronDown size={14} className="-rotate-90 text-blue-300 group-hover:text-blue-600 transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest">Search Courses for "{searchQuery}"</span>
                    </Link>
                    <Link
                        href={`/tuition?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white hover:shadow-sm transition-all text-cyan-600 group"
                    >
                        <ChevronDown size={14} className="-rotate-90 text-cyan-300 group-hover:text-cyan-600 transition-colors" />
                        <span className="text-xs font-black uppercase tracking-widest">Search Tuition for "{searchQuery}"</span>
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <nav className="flex items-center justify-between gap-4 px-6 lg:px-12 h-20 relative w-full lg:max-w-[1400px] lg:mx-auto">
                {/* Logo */}
                <div className="flex items-center w-36 sm:w-40 lg:w-48 relative h-full shrink-0">
                    <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 py-2">
                        <Image src="/assets/logo.PNG" alt="Nexvera Hub" width={200} height={100} className="h-16 sm:h-20 lg:h-24 w-auto object-contain drop-shadow-sm transition-all" />
                    </Link>
                </div>

                {/* Desktop Menu - moved to central area but with better spacing */}
                <div className="hidden lg:flex items-center ml-16 gap-7 text-slate-600 font-medium text-[14px] shrink-0">
                    <Link href="/" className={pathname === "/" ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Home</Link>
                    <NavDropdown title="About" items={aboutItems} />
                    <Link href="/courses" className={pathname === "/courses" ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Courses</Link>
                    <Link href="/tuition" className={pathname?.startsWith("/tuition") ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Tuition</Link>
                    <NavDropdown title="Resources" items={resourceItems} />
                    <Link href="/contact" className={pathname === "/contact" ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Contact</Link>
                </div>

                {/* Search Bar - Center Right */}
                <div className="hidden lg:block flex-1 max-w-md mx-4 relative">
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                            placeholder="Type to search catalog..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-full py-2.5 pl-12 pr-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600">
                                <Loader2 className="animate-spin" size={16} />
                            </div>
                        )}
                    </form>
                    {renderSearchDropdown()}
                    <AnimatePresence>
                        {showSuggestions && (
                            <div className="fixed inset-0 z-[90]" onClick={() => setShowSuggestions(false)}></div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right side: Auth + Hamburger */}
                <div className="flex items-center gap-4 shrink-0">
                    <CountryDropdown />
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Link href="/login" className="hidden xl:block text-slate-700 font-semibold px-4 py-2 text-sm hover:text-blue-600 transition-colors cursor-pointer outline-none">Log In</Link>
                            <Link href="/register" className="hidden sm:block bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-lg shadow-blue-200 cursor-pointer outline-none text-center">
                                Sign Up
                            </Link>
                        </div>
                    ) : (
                        <div className="relative flex items-center gap-2">
                            <div className="relative">
                                <button
                                    onClick={toggleNotifications}
                                    className="p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-full transition-colors relative outline-none cursor-pointer"
                                    aria-label="Notifications"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border border-white">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                {renderNotificationsDropdown()}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-1 pl-3 rounded-full border border-slate-200 hover:border-blue-200 transition-all hover:bg-blue-50/50"
                                >
                                    <span className="text-sm font-bold text-slate-700 hidden sm:block">{user?.name?.split(' ')[0]}</span>
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                        {user?.name?.[0].toUpperCase()}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-50 mb-2">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                                                </div>

                                                <Link
                                                    href={user?.role === 'admin' ? '/admin/courses' : user?.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'}
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <LayoutDashboard size={18} />
                                                    {user?.role === 'admin' ? 'Admin Catalog' : 'Dashboard'}
                                                </Link>

                                                <Link
                                                    href="/profile"
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User size={18} />
                                                    Profile
                                                </Link>

                                                <button
                                                    onClick={() => { logout(); setIsUserMenuOpen(false); }}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all text-left"
                                                >
                                                    <LogOut size={18} />
                                                    Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Hamburger Button */}
                    <button
                        className="lg:hidden p-2 -mr-2 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "calc(100vh - 5rem)" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="absolute top-full left-0 w-full bg-white lg:hidden flex flex-col shadow-2xl overflow-hidden z-[100] border-t border-slate-100"
                    >
                        <div className="p-6 flex-1 flex flex-col text-lg font-medium text-slate-800 overflow-y-auto w-full">
                            {/* Mobile Search */}
                            <div className="mb-6 relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search catalog..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800 outline-none"
                                />
                                {renderSearchDropdown()}
                            </div>

                            {isAuthenticated && (
                                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl mb-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
                                        {user?.name?.[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{user?.name}</p>
                                        <p className="text-xs text-blue-600 uppercase font-black tracking-widest">{user?.role}</p>
                                    </div>
                                </div>
                            )}

                            <Link
                                href="/"
                                onClick={closeMobileMenu}
                                className={`flex items-center justify-between w-full py-4 border-b border-slate-100 ${pathname === "/" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Home
                            </Link>

                            <MobileNavDropdown title="About Us" items={aboutItems} closeMenu={closeMobileMenu} />

                            <Link
                                href="/courses"
                                onClick={closeMobileMenu}
                                className={`flex items-center justify-between w-full py-4 border-b border-slate-100 ${pathname === "/courses" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Courses
                            </Link>

                            <Link
                                href="/tuition"
                                onClick={closeMobileMenu}
                                className={`flex items-center justify-between w-full py-4 border-b border-slate-100 ${pathname?.startsWith("/tuition") ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Tuition
                            </Link>

                            <MobileNavDropdown title="Resources" items={resourceItems} closeMenu={closeMobileMenu} />

                            <Link
                                href="/contact"
                                onClick={closeMobileMenu}
                                className={`flex items-center justify-between w-full py-4 ${pathname === "/contact" ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Contact
                            </Link>

                            {/* Mobile Auth Buttons */}
                            {!isAuthenticated ? (
                                <div className="flex flex-col gap-4 sm:hidden mt-8 pb-10">
                                    <Link href="/login" onClick={closeMobileMenu} className="w-full text-center text-slate-700 font-semibold py-4 bg-slate-50 border border-slate-200 rounded-2xl active:scale-95 transition-transform cursor-pointer outline-none">Log In</Link>
                                    <Link href="/register" onClick={closeMobileMenu} className="w-full text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-transform cursor-pointer outline-none">
                                        Get Started
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 mt-8 pb-10">
                                    <button
                                        onClick={() => { logout(); closeMobileMenu(); }}
                                        className="w-full text-center text-red-600 font-bold py-4 bg-red-50 border border-red-100 rounded-2xl active:scale-95 transition-transform cursor-pointer outline-none"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
