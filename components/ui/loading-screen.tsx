'use client';

import React from 'react';
import { Spinner } from '@/components/ui/spinner';

interface LoadingScreenProps {
    isLoading: boolean;
    message?: string;
}

export function LoadingScreen({ isLoading, message = 'Loading...' }: LoadingScreenProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
                <Spinner className="w-10 h-10 text-primary animate-spin" />
                <p className="text-foreground font-medium">{message}</p>
            </div>
        </div>
    );
}
