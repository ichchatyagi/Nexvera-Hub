import React from 'react';

const MobileAppBanner = () => {
    return (
        <div 
            className="w-full py-10 relative z-10" 
            style={{ background: 'linear-gradient(to right, #f0f9ff 0%, #bae6fd 40%, #0369a1 80%, #075985 100%)' }}
        >
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col items-center justify-center text-center">
                    {/* Simplified Centered Text Content */}
                    <h3 className="text-slate-900 font-black text-xl md:text-3xl lg:text-4xl tracking-tight uppercase">
                        Our Mobile App – <span className="text-blue-700">Coming Soon</span>
                    </h3>
                    <p className="text-slate-700 font-semibold text-sm md:text-lg mt-3 tracking-tight">
                        Android & iOS apps launching soon.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MobileAppBanner;
