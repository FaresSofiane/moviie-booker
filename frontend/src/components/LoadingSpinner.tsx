// src/components/LoadingSpinner.tsx
import React from 'react';

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center w-full h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
};

export default LoadingSpinner;