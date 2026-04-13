import React from 'react';
import {
    Brain, Monitor, Film, Heart, Languages, Briefcase, BarChart3, TrendingUp,
    Construction, GraduationCap, User, Rocket, PlayCircle, Users, Award,
    Sparkles, Shield, Zap, Target, BookOpen, Smartphone, Settings,
    Globe, Cloud, AlertTriangle, FileCode, CheckCircle, Video,
    Clapperboard, Database, Search, Flame, Link, Radio, Palette,
    Gamepad2, Plug, Mic, Music, Speaker, Megaphone, DollarSign,
    Users2, Newspaper, Mail, Microscope, Activity, Leaf,
    Scale, Calculator, Atom, FlaskConical, Cpu, BookText,
    Map, Compass, Trophy, HardHat, Hammer, PenTool, Trees,
    ArrowRight, ArrowUp
} from 'lucide-react';

const iconMap = {
    // Categories
    'Artificial Intelligence': Brain,
    'Information Technology': Monitor,
    'Media & Entertainment': Film,
    'Health & Wellness': Heart,
    'Language Learning': Languages,
    'Business & Entrepreneurship': Briefcase,
    'Management': BarChart3,
    'Sales & Marketing': TrendingUp,
    'Engineering & Construction': Construction,
    'Teaching & Academics': GraduationCap,
    'Personal Development': User,
    'Data Science': Database,
    'Design': Palette,
    'Languages': Languages,
    'Business': Briefcase,
    'Entrepreneurship': Rocket,
    'Class 5': BookOpen,
    'Class 6': Calculator,
    'Class 7': Atom,
    'Class 8': FlaskConical,
    'Class 9': Microscope,
    'Class 10': GraduationCap,
    'Class 11': Compass,
    'Class 12': Trophy,

    // Common Emojis found in course data
    '🤖': BotIcon, // Custom fallback
    '🐍': FileCode,
    '🌐': Globe,
    '🛡️': Shield,
    '☁️': Cloud,
    '🧠': Brain,
    '📱': Smartphone,
    '⚙️': Settings,
    '🖥️': Monitor,
    '📊': BarChart3,
    '🕵️': Search,
    '🔥': Flame,
    '⛓️': Link,
    '📡': Radio,
    '🎨': Palette,
    '🐧': Terminal,
    '🎮': Gamepad2,
    '🔌': Plug,
    '✅': CheckCircle,
    '🎥': Video,
    '🎬': Clapperboard,
    '✂️': Scissors,
    '🔊': Speaker,
    '🎭': Mask,
    '👑': Crown,
    '✍️': PenTool,
    '✒️': PenTool,
    '📋': ClipboardList,
    '💡': Lightbulb,
    '🤳': Smartphone,
    '💰': DollarSign,
    '📢': Megaphone,
    '🤝': Users2,
    '📰': Newspaper,
    '🗣️': MessageSquare,
    '🎤': Mic,
    '🆘': AlertCircle,
    '📽️': Video,
    '🌍': Globe,
    '📦': Box,
    '⭐': Star,
    '🎙️': Mic,
    '🎵': Music,
    '🎸': Guitar,
    '🎉': PartyPopper,
    '🎧': Headphones,
    '👠': ShoppingBag,
    '🏆': Trophy,
    '🥽': Glasses,
    '😂': Laugh,
    '🥗': Salad,
    '🧘': Activity,
    '💪': Dumbbell,
    '🌊': Waves,
    '🌿': Leaf,
    '🎗️': Bookmark,
    '🚺': User,
    '⏳': Hourglass,
    '🏃': Activity,
    '⚖️': Scale,
    '☯️': Activity,
    '😴': Moon,
    '🔋': Battery,
    '🎈': PartyPopper,
    '🌱': Leaf,
    '🍳': Utensils,
    '🏢': Building2,
    '🇬🇧': Languages,
    '🇪🇸': Languages,
    '🇫🇷': Languages,
    '🇮🇳': Languages,
    '🇯🇵': Languages,
    '🇨🇳': Languages,
    '🇦🇪': Languages,
    '🇮🇹': Languages,
    '🇷🇺': Languages,
    '🇵🇹': Languages,
    '🇰🇷': Languages,
    '📝': FileText,
    '📖': BookOpen,
    '📚': Library,
    '🛒': ShoppingCart,
    '🏗️': Construction,
    '📐': Ruler,
    '⚡': Zap,
    '🏛️': Landmark,
    '❄️': Snowflake,
    '🔭': Telescope,
    '🦺': ShieldAlert,
    '🧱': Box,
    '📄': File,
    '🏫': School,
    '🧩': Puzzle,
    '🧸': Baby,
    '🎯': Target,
    '🦁': Shield,
    '🌳': Trees,
    '➕': PlusSquare,
    '▶️': PlayCircle,
    '👥': Users,
    '🎓': GraduationCap,
    '📈': TrendingUp,
    '✨': Sparkles,
    '🚀': Rocket,
    '👉': ArrowRight,
    '👆': ArrowUp,
    'Default': BookOpen
};

// Internal fallbacks for missing icons in imports or specific needs
function BotIcon(props) { return <Cpu {...props} />; }
function Terminal(props) { return <Monitor {...props} />; }
function Scissors(props) { return <PenTool {...props} />; }
function Mask(props) { return <Palette {...props} />; }
function Crown(props) { return <Award {...props} />; }
function ClipboardList(props) { return <BookText {...props} />; }
function Lightbulb(props) { return <Sparkles {...props} />; }
function AlertCircle(props) { return <AlertTriangle {...props} />; }
function Box(props) { return <Database {...props} />; }
function Star(props) { return <Award {...props} />; }
function Guitar(props) { return <Music {...props} />; }
function PartyPopper(props) { return <Sparkles {...props} />; }
function Headphones(props) { return <Speaker {...props} />; }
function ShoppingBag(props) { return <Briefcase {...props} />; }
function Glasses(props) { return <Monitor {...props} />; }
function Laugh(props) { return <Activity {...props} />; }
function Salad(props) { return <Heart {...props} />; }
function Dumbbell(props) { return <Activity {...props} />; }
function Waves(props) { return <Activity {...props} />; }
function Bookmark(props) { return <Award {...props} />; }
function Hourglass(props) { return <TrendingUp {...props} />; }
function Moon(props) { return <Heart {...props} />; }
function Battery(props) { return <Zap {...props} />; }
function Utensils(props) { return <Heart {...props} />; }
function Building2(props) { return <Briefcase {...props} />; }
function FileText(props) { return <BookText {...props} />; }
function Library(props) { return <BookOpen {...props} />; }
function ShoppingCart(props) { return <Briefcase {...props} />; }
function Ruler(props) { return <PenTool {...props} />; }
function Landmark(props) { return <Building2 {...props} />; }
function Snowflake(props) { return <Activity {...props} />; }
function Telescope(props) { return <Search {...props} />; }
function ShieldAlert(props) { return <Shield {...props} />; }
function File(props) { return <BookOpen {...props} />; }
function School(props) { return <GraduationCap {...props} />; }
function Puzzle(props) { return <Brain {...props} />; }
function Baby(props) { return <User {...props} />; }
function MessageSquare(props) { return <Languages {...props} />; }
function PlusSquare(props) { return <TrendingUp {...props} />; }

const categoryStyles = {
    'Artificial Intelligence': { colors: ['#60A5FA', '#3B82F6', '#2563EB'], glow: 'rgba(59, 130, 246, 0.3)' },
    'Information Technology': { colors: ['#38BDF8', '#0EA5E9', '#0284C7'], glow: 'rgba(14, 165, 233, 0.3)' },
    'Sales and Marketing': { colors: ['#F87171', '#EF4444', '#DC2626'], glow: 'rgba(239, 68, 68, 0.3)' },
    'Data Science': { colors: ['#A78BFA', '#8B5CF6', '#7C3AED'], glow: 'rgba(139, 92, 246, 0.3)' },
    'Design': { colors: ['#F472B6', '#EC4899', '#DB2777'], glow: 'rgba(236, 72, 153, 0.3)' },
    'Languages': { colors: ['#FBBF24', '#F59E0B', '#D97706'], glow: 'rgba(245, 158, 11, 0.3)' },
    'Business': { colors: ['#FB923C', '#F97316', '#EA580C'], glow: 'rgba(249, 115, 22, 0.3)' },
    'Entrepreneurship': { colors: ['#22D3EE', '#06B6D4', '#0891B2'], glow: 'rgba(6, 182, 212, 0.3)' },
    'Class 5': { colors: ['#60A5FA', '#3B82F6', '#2563EB'], glow: 'rgba(59, 130, 246, 0.3)' },
    'Class 6': { colors: ['#38BDF8', '#0EA5E9', '#0284C7'], glow: 'rgba(14, 165, 233, 0.3)' },
    'Class 7': { colors: ['#A78BFA', '#8B5CF6', '#7C3AED'], glow: 'rgba(139, 92, 246, 0.3)' },
    'Class 8': { colors: ['#F472B6', '#EC4899', '#DB2777'], glow: 'rgba(236, 72, 153, 0.3)' },
    'Class 9': { colors: ['#FBBF24', '#F59E0B', '#D97706'], glow: 'rgba(245, 158, 11, 0.3)' },
    'Class 10': { colors: ['#FB923C', '#F97316', '#EA580C'], glow: 'rgba(249, 115, 22, 0.3)' },
    'Class 11': { colors: ['#22D3EE', '#06B6D4', '#0891B2'], glow: 'rgba(6, 182, 212, 0.3)' },
    'Class 12': { colors: ['#F87171', '#EF4444', '#DC2626'], glow: 'rgba(239, 68, 68, 0.3)' },
    'Default': { colors: ['#94A3B8', '#64748B', '#475569'], glow: 'rgba(148, 163, 184, 0.2)' }
};

const IconRenderer = ({ icon, className = "w-6 h-6", category = "", showGlow = false }) => {
    // If it's a category name, try to get its icon
    let IconComp = iconMap[icon] || iconMap[category];
    const style = categoryStyles[category] || categoryStyles[icon] || categoryStyles['Default'];
    const gradientId = `gradient-${(category || icon || 'default').replace(/\s+/g, '-').toLowerCase()}`;

    // Fallback logic
    if (!IconComp) {
        if (category.toLowerCase().includes('it') || category.toLowerCase().includes('tech')) IconComp = Monitor;
        else if (category.toLowerCase().includes('ai')) IconComp = Brain;
        else if (category.toLowerCase().includes('health')) IconComp = Heart;
        else IconComp = BookOpen;
    }

    return (
        <div className="relative flex items-center justify-center">
            {showGlow && (
                <div
                    className="absolute inset-0 blur-2xl opacity-50 rounded-full"
                    style={{ backgroundColor: style.glow }}
                />
            )}
            <svg width="0" height="0" className="absolute">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={style.colors[0]} />
                        <stop offset="50%" stopColor={style.colors[1]} />
                        <stop offset="100%" stopColor={style.colors[2]} />
                    </linearGradient>
                </defs>
            </svg>
            <IconComp
                className={`${className} relative z-10 transition-all duration-500`}
                style={{ stroke: `url(#${gradientId})`, filter: `drop-shadow(0 2px 4px ${style.glow})` }}
            />
        </div>
    );
};

export default IconRenderer;
