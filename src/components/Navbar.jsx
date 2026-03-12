import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';
import logo from '../assets/logo.PNG';

const NavDropdown = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState(false);

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
                        {items.map((item, idx) => (
                            <NavLink
                                key={idx}
                                to={item.path}
                                className={({ isActive }) => `
                                    block px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                    ${isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}
                                `}
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const MobileNavDropdown = ({ title, items, closeMenu }) => {
    const [isOpen, setIsOpen] = useState(false);

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
                            {items.map((item, idx) => (
                                <NavLink
                                    key={idx}
                                    to={item.path}
                                    onClick={closeMenu}
                                    className={({ isActive }) => `
                                        block text-[15px] font-medium transition-all
                                        ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-600'}
                                    `}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const aboutItems = [
        { label: 'About Nexvera', path: '/about' },
        { label: 'Certifications', path: '/certifications' }
    ];

    const resourceItems = [
        { label: 'Blog', path: '/blog' },
        { label: 'Free Guides', path: '/free-guides' },
        { label: 'Learning Roadmaps', path: '/roadmaps' }
    ];

    const careerItems = [
        { label: 'Career Support', path: '/career-support' },
        { label: 'Student Success Stories', path: '/student-stories' },
        { label: 'FAQ', path: '/faq' }
    ];

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
            <nav className="flex items-center justify-between px-6 lg:px-12 h-20 relative w-full lg:max-w-7xl lg:mx-auto xl:max-w-none xl:mx-0">
                {/* Logo */}
                <div className="flex items-center w-36 lg:w-48 relative h-full shrink-0">
                    <NavLink to="/" className="absolute left-0 top-1/2 -translate-y-1/2 py-2">
                        <img src={logo} alt="Nexvera Hub" className="h-24 lg:h-32 w-auto object-contain drop-shadow-sm" />
                    </NavLink>
                </div>

                {/* Desktop Links (Centered via absolute positioning to look balanced) */}
                <div className="hidden lg:flex items-center justify-center gap-8 text-slate-600 font-medium text-[15px] absolute left-1/2 -translate-x-1/2">
                    <NavLink to="/" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Home</NavLink>
                    <NavDropdown title="About" items={aboutItems} />
                    <NavLink to="/course" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Courses</NavLink>
                    <NavDropdown title="Resources" items={resourceItems} />
                    <NavDropdown title="Career" items={careerItems} />
                    <NavLink to="/contact" className={({ isActive }) => isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600 transition-colors"}>Contact</NavLink>
                </div>

                {/* Right side: Auth + Hamburger */}
                <div className="flex items-center gap-3 lg:gap-4 shrink-0">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <NavLink to="/login" className="hidden sm:block text-slate-700 font-semibold px-4 py-2 text-sm lg:text-base hover:text-blue-600 transition-colors">Log In</NavLink>
                        <NavLink to="/signup" className="hidden sm:block bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-5 lg:px-6 py-2 rounded-full text-sm lg:text-base transition-all shadow-lg shadow-blue-200">
                            Sign Up
                        </NavLink>
                    </div>

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
                            <NavLink
                                to="/"
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `flex items-center justify-between w-full py-4 border-b border-slate-100 ${isActive ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Home
                            </NavLink>

                            <MobileNavDropdown title="About Us" items={aboutItems} closeMenu={closeMobileMenu} />

                            <NavLink
                                to="/course"
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `flex items-center justify-between w-full py-4 border-b border-slate-100 ${isActive ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Courses
                            </NavLink>

                            <MobileNavDropdown title="Resources" items={resourceItems} closeMenu={closeMobileMenu} />
                            <MobileNavDropdown title="Career" items={careerItems} closeMenu={closeMobileMenu} />

                            <NavLink
                                to="/contact"
                                onClick={closeMobileMenu}
                                className={({ isActive }) => `flex items-center justify-between w-full py-4 ${isActive ? "text-blue-600 font-bold" : "hover:text-blue-600 transition-colors"}`}
                            >
                                Contact
                            </NavLink>

                            {/* Mobile Auth Buttons */}
                            <div className="flex flex-col gap-4 sm:hidden mt-8 pb-10">
                                <NavLink to="/login" onClick={closeMobileMenu} className="w-full text-center text-slate-700 font-semibold py-4 bg-slate-50 border border-slate-200 rounded-2xl active:scale-95 transition-transform">Log In</NavLink>
                                <NavLink to="/signup" onClick={closeMobileMenu} className="w-full text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-transform">
                                    Get Started
                                </NavLink>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
