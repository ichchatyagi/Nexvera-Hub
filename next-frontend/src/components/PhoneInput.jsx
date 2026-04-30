"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { countries } from '@/lib/countries';

const PhoneInput = ({ value, onChange, placeholder = "00000 00000", required = false, name = "phone" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to India
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sync selected country with incoming value if it changes externally
    useEffect(() => {
        if (value && value.startsWith('+')) {
            // Find the longest matching dial code to avoid ambiguity (e.g. +1 vs +1242)
            const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
            const country = sortedCountries.find(c => value.startsWith(c.dialCode));
            if (country) setSelectedCountry(country);
        }
    }, [value]);

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dialCode.includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCountrySelect = (country) => {
        const localNumber = value ? value.replace(selectedCountry.dialCode, '') : '';
        setSelectedCountry(country);
        setIsOpen(false);
        setSearchTerm('');
        
        // Update the parent with the new combined number
        onChange({ 
            target: { 
                name, 
                value: country.dialCode + localNumber 
            } 
        });
    };

    const handleNumberChange = (e) => {
        const inputVal = e.target.value.replace(/\D/g, ''); // Extract only digits
        onChange({ 
            target: { 
                name, 
                value: selectedCountry.dialCode + inputVal 
            } 
        });
    };

    // Extract only the local digits for the text input display
    const localPart = value ? value.replace(selectedCountry.dialCode, '') : '';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="flex gap-1 sm:gap-2">
                {/* Country Selection Button */}
                <div className="relative shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className={`
                            h-full px-2 sm:px-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 sm:gap-3 
                            hover:bg-white hover:border-blue-300 transition-all outline-none
                            ${isOpen ? 'ring-4 ring-blue-500/5 border-blue-300 bg-white' : ''}
                        `}
                    >
                        <img 
                            src={`https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`} 
                            alt={selectedCountry.name}
                            className="w-6 h-4 object-cover rounded-[2px] shadow-sm"
                        />
                        <span className="font-bold text-slate-800 text-sm min-w-[2.5rem] text-left">{selectedCountry.dialCode}</span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full left-0 mt-3 w-72 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[100] p-3 flex flex-col max-h-80 overflow-hidden"
                            >
                                {/* Search dropdown interior */}
                                <div className="relative mb-3">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Search country..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-900 outline-none focus:bg-white focus:border-blue-200 transition-all placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                                    {filteredCountries.map((c) => (
                                        <button
                                            key={c.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(c)}
                                            className={`
                                                w-full flex items-center justify-between p-2.5 rounded-xl transition-all mb-1 last:mb-0 group
                                                ${selectedCountry.code === c.code ? 'bg-blue-50' : 'hover:bg-slate-50'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={`https://flagcdn.com/${c.code.toLowerCase()}.svg`} 
                                                    alt={c.name}
                                                    className="w-5 h-3.5 object-cover rounded-[1px] shadow-sm transition-transform group-hover:scale-110"
                                                />
                                                <span className={`text-xs font-bold leading-none ${selectedCountry.code === c.code ? 'text-blue-600' : 'text-slate-600'} group-hover:text-blue-600`}>
                                                    {c.name}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-400 tabular-nums">{c.dialCode}</span>
                                        </button>
                                    ))}
                                    {filteredCountries.length === 0 && (
                                        <div className="py-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest space-y-2">
                                            <p>No matches</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Local Number Input */}
                <input
                    required={required}
                    type="tel"
                    id={name}
                    name={name}
                    value={localPart}
                    onChange={handleNumberChange}
                    className="flex-1 min-w-0 px-3 sm:px-6 py-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white focus:border-blue-300 transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm uppercase tracking-tight"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

export default PhoneInput;
