import React from 'react';

/**
 * Reusable background component for specific pages.
 * Provides the original blue-to-dark-blue gradient flow with atmospheric glow.
 */
const PageBackground = () => {
    return (
        <div className="bg-main-wrapper" aria-hidden="true">
            <div className="bg-oval-shape"></div>
            <div className="hero-glow"></div>
        </div>
    );
};

export default PageBackground;
