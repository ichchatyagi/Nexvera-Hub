import React from 'react';
import appLogo from '../assets/applogo.webp';

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
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                        <p className="text-slate-700 font-bold text-sm md:text-base lg:text-lg uppercase tracking-widest">
                            Android & iOS apps launching soon on
                        </p>
                        
                        <img 
                            src={appLogo} 
                            alt="Android and iOS apps launching soon" 
                            className="h-8 md:h-10 lg:h-12 w-auto object-contain drop-shadow-lg transition-transform hover:scale-105"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileAppBanner;
