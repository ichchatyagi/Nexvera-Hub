import React from 'react';
import Image from 'next/image';


const MobileAppBanner = () => {
    return (
        <div
            className="w-full py-10 relative z-10"
            style={{ background: 'linear-gradient(to right, #f0f9ff 0%, #bae6fd 40%, #0369a1 80%, #075985 100%)' }}
        >
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-slate-900 font-black text-xl md:text-3xl lg:text-4xl tracking-tight uppercase">
                        Our Mobile App – <span className="text-blue-700">Coming Soon</span>
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                        <p className="text-slate-700 font-bold text-sm md:text-base lg:text-lg uppercase tracking-widest sm:mr-2">
                            Android & iOS apps launching soon on
                        </p>

                        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-3 shadow-xl hover:bg-white/20 transition-all duration-300">
                            <Image
                                src="/assets/play-removebg-preview.png"
                                alt="Get it on Google Play"
                                width={120}
                                height={48}
                                className="h-10 md:h-12 lg:h-14 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            />
                            <div className="w-px h-10 bg-white/30 rounded-full mx-1"></div>
                            <Image
                                src="/assets/app.webp"
                                alt="Download on the App Store"
                                width={120}
                                height={48}
                                className="h-10 md:h-12 lg:h-14 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileAppBanner;

