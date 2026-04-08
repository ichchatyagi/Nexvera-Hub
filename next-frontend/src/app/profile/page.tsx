"use client";

import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Calendar, 
  Camera, 
  Save, 
  Clock, 
  Languages, 
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Star,
  BookOpen,
  Award,
  Wallet,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('personal'); // personal, professional, security
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        country: '',
        timezone: '',
        language: '',
        phone: '',
        avatarUrl: '',
        // Professional / Teacher Info
        headline: '',
        expertise: [] as string[],
        qualifications: '',
        yearsExperience: 0,
        hourlyRate: 0,
        // Student Info
        educationLevel: '',
        interests: [] as string[],
        learningGoals: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: (user as any).firstName || user.name?.split(' ')[0] || '',
                lastName: (user as any).lastName || user.name?.split(' ').slice(1).join(' ') || '',
                bio: (user as any).bio || '',
                country: (user as any).country || '',
                timezone: (user as any).timezone || '',
                language: (user as any).language || 'English',
                phone: (user as any).phone || '',
                avatarUrl: (user as any).avatarUrl || '',
                // These might not be in the current user object yet due to backend limitations
                headline: (user as any).headline || '',
                expertise: (user as any).expertise || [],
                qualifications: (user as any).qualifications || '',
                yearsExperience: (user as any).yearsExperience || 0,
                hourlyRate: (user as any).hourlyRate || 0,
                educationLevel: (user as any).educationLevel || '',
                interests: (user as any).interests || [],
                learningGoals: (user as any).learningGoals || '',
            }));
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response: any = await api.put('/users/me', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                bio: formData.bio,
                country: formData.country,
                timezone: formData.timezone,
                language: formData.language,
                phone: formData.phone,
                avatarUrl: formData.avatarUrl,
                // Role-specific fields
                headline: formData.headline,
                expertise: formData.expertise,
                qualifications: formData.qualifications,
                yearsExperience: Number(formData.yearsExperience),
                hourlyRate: Number(formData.hourlyRate),
                educationLevel: formData.educationLevel,
                interests: formData.interests,
                learningGoals: formData.learningGoals,
            });

            if (response.data) {
                updateUser(response.data);
                toast.success('Profile updated successfully!');
            }
        } catch (error: any) {
            console.error('Update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'personal', label: 'Personal Details', icon: UserIcon },
        ...(user?.role === 'teacher' ? [{ id: 'professional', label: 'Teaching Profile', icon: Briefcase }] : []),
        ...(user?.role === 'student' ? [{ id: 'professional', label: 'Learning Context', icon: GraduationCap }] : []),
        { id: 'security', label: 'Account Security', icon: ShieldCheck }
    ];

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header / Hero Section */}
            <div className="relative h-80 bg-slate-950 overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] -ml-20 -mb-20" />
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full flex flex-col justify-end pb-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-end gap-8 relative z-10"
                    >
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-cyan-400 p-1 shadow-2xl overflow-hidden">
                                <div className="w-full h-full bg-slate-900 rounded-[2.3rem] flex items-center justify-center overflow-hidden">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-5xl font-black text-white">{user.name?.[0].toUpperCase()}</span>
                                    )}
                                </div>
                            </div>
                            <button className="absolute bottom-2 right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-transform group">
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* User Metadata */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 backdrop-blur-md">
                                    {user.role} Authorization
                                </span>
                                {user.role === 'teacher' && (
                                    <span className="px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-green-400 backdrop-blur-md">
                                        Verified Expert
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                                {user.name || 'Nexvera User'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-medium">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-blue-500" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                {formData.country && (
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-cyan-500" />
                                        <span className="text-sm">{formData.country}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-500" />
                                    <span className="text-sm">Joined April 2024</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats (Desktop) */}
                        <div className="hidden lg:flex gap-4 pb-4">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 min-w-[140px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Courses</p>
                                <p className="text-3xl font-black text-white text-center">12</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 min-w-[140px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Achievements</p>
                                <p className="text-3xl font-black text-white text-center">8</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-32">
                            <div className="space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-tight transition-all ${
                                            activeTab === tab.id 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                    >
                                        <tab.icon size={20} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-slate-50 px-4">
                                <div className="p-6 bg-slate-50 rounded-3xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Storage Usage</p>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full mb-3">
                                        <div className="w-[35%] h-full bg-blue-600 rounded-full" />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase">350 MB / 1 GB</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-9">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl shadow-slate-200/50 border border-slate-100"
                        >
                            <form onSubmit={handleSubmit}>
                                <AnimatePresence mode="wait">
                                    {activeTab === 'personal' && (
                                        <motion.div
                                            key="personal"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-12"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2">Personal Intelligence</h2>
                                                    <p className="text-sm text-slate-400 font-medium">Configure your core identity metrics and communication channels.</p>
                                                </div>
                                                <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                                    <UserIcon size={24} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Primary Identifier (First Name)</label>
                                                    <input 
                                                        type="text" 
                                                        name="firstName"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        placeholder="Jane"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Secondary Identifier (Last Name)</label>
                                                    <input 
                                                        type="text" 
                                                        name="lastName"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        placeholder="Smith"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Communication Line (Phone)</label>
                                                    <input 
                                                        type="text" 
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Geographic Origin (Country)</label>
                                                    <input 
                                                        type="text" 
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        placeholder="United Kingdom"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Temporal Node (Timezone)</label>
                                                    <select 
                                                        name="timezone"
                                                        value={formData.timezone}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                                                    >
                                                        <option value="GMT">GMT (Universal)</option>
                                                        <option value="EST">EST (New York)</option>
                                                        <option value="PST">PST (San Francisco)</option>
                                                        <option value="IST">IST (India)</option>
                                                        <option value="JST">JST (Tokyo)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Linguistic Preference</label>
                                                    <select 
                                                        name="language"
                                                        value={formData.language}
                                                        onChange={handleInputChange}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                                                    >
                                                        <option value="English">English</option>
                                                        <option value="Hindi">Hindi</option>
                                                        <option value="Spanish">Spanish</option>
                                                        <option value="French">French</option>
                                                        <option value="German">German</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Persona Narrative (Bio)</label>
                                                <textarea 
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-8 py-6 text-slate-900 font-medium outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                                                    placeholder="Share your expertise, goals, and story..."
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'professional' && (
                                        <motion.div
                                            key="professional"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-12"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2">
                                                        {user.role === 'teacher' ? 'Faculty Credentials' : 'Learning Portfolio'}
                                                    </h2>
                                                    <p className="text-sm text-slate-400 font-medium">
                                                        {user.role === 'teacher' 
                                                            ? 'Showcase your mastery and pedagogical experience to the Nexvera audience.' 
                                                            : 'Track your educational trajectory and core interests.'}
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-cyan-50 text-cyan-600 rounded-3xl">
                                                    {user.role === 'teacher' ? <Briefcase size={24} /> : <GraduationCap size={24} />}
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-white">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                     {[
                                                        { label: user.role === 'teacher' ? 'Courses Taught' : 'Enrolled', value: '42', icon: BookOpen },
                                                        { label: user.role === 'teacher' ? 'Rating' : 'GPA / Avg', value: '4.9', icon: Star },
                                                        { label: user.role === 'teacher' ? 'Students' : 'Hours Learnt', value: '2.4k', icon: Clock },
                                                     ].map((item, i) => (
                                                        <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
                                                                <item.icon size={20} />
                                                            </div>
                                                            <p className="text-3xl font-black text-slate-950 mb-1">{item.value}</p>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                                        </div>
                                                     ))}
                                                </div>
                                            </div>

                                            {user.role === 'teacher' ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Professional Headline</label>
                                                        <input 
                                                            type="text" 
                                                            name="headline"
                                                            value={formData.headline}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                            placeholder="Senior Cloud Architect | Fintech Specialist"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Clinical Experience (Years)</label>
                                                        <input 
                                                            type="number" 
                                                            name="yearsExperience"
                                                            value={formData.yearsExperience}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Core Expertise Domains (Comma separated)</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.expertise.join(', ')}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, expertise: e.target.value.split(',').map(s => s.trim()) }))}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                            placeholder="Node.js, AWS, Kubernetes, Distributed Systems"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Education Level</label>
                                                        <select 
                                                            name="educationLevel"
                                                            value={formData.educationLevel}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                                                        >
                                                            <option value="undergraduate">Undergraduate</option>
                                                            <option value="postgraduate">Postgraduate</option>
                                                            <option value="professional">Working Professional</option>
                                                            <option value="highschool">High School</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Focus Interests (Comma separated)</label>
                                                        <input 
                                                            type="text" 
                                                            value={formData.interests.join(', ')}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value.split(',').map(s => s.trim()) }))}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                            placeholder="AI, Web3, Cloud Computing"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {activeTab === 'security' && (
                                        <motion.div
                                            key="security"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-12"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter mb-2">Authority Lockdown</h2>
                                                    <p className="text-sm text-slate-400 font-medium">Protect your nodal access and credential integrity.</p>
                                                </div>
                                                <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl">
                                                    <ShieldCheck size={24} />
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-white flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-4 bg-white shadow-sm rounded-2xl text-blue-600">
                                                            <Mail size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-950 uppercase tracking-tight mb-1">Email Verification</p>
                                                            <p className="text-xs text-slate-400 font-medium">Your primary identity path is verified.</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-4 py-2 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Verified</span>
                                                </div>

                                                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-white flex items-center justify-between">
                                                    <div className="flex items-center gap-6">
                                                        <div className="p-4 bg-white shadow-sm rounded-2xl text-orange-600">
                                                            <ShieldCheck size={24} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-950 uppercase tracking-tight mb-1">Pass-key Protocol</p>
                                                            <p className="text-xs text-slate-400 font-medium">Last rotated 45 days ago.</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" className="px-6 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-colors">Rotate Key</button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Protocol</label>
                                                    <input 
                                                        type="password" 
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Protocol</label>
                                                    <input 
                                                        type="password" 
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-slate-900 font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer Actions */}
                                <div className="mt-16 pt-10 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Final Authority Confirmation</p>
                                        <p className="text-xs text-slate-400 font-medium">Changes will be synchronized across all Nexvera nodes globally.</p>
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full md:w-auto min-w-[200px] flex items-center justify-center gap-3 bg-slate-950 hover:bg-blue-600 text-white font-black uppercase tracking-widest px-10 py-5 rounded-[2rem] shadow-2xl transition-all disabled:opacity-50 group"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={20} className="group-hover:scale-110 transition-transform" />
                                                Commit Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
