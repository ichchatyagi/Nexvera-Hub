"use client";

import { motion } from 'framer-motion';

const MetallicCard = ({ children, color = "from-blue-600 to-indigo-700", className = "", borderGradient = "from-slate-400 via-white to-slate-400" }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        className={`relative p-[1.5px] rounded-[2.5rem] bg-gradient-to-br ${borderGradient} shadow-2xl group overflow-hidden ${className}`}
    >
        <div className={`bg-gradient-to-br ${color} p-10 rounded-[2.4rem] h-full flex flex-col relative`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
            {children}
        </div>
    </motion.div>
);

export default MetallicCard;
