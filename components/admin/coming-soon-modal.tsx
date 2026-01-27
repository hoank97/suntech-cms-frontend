'use client';

import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface ComingSoonModalProps {
  title: string;
  description?: string;
}

export function ComingSoonModal({ title, description }: ComingSoonModalProps) {
  const router = useRouter();

  useEffect(() => {
    // Show the modal when component mounts
    const timer = setTimeout(() => {
      // Auto-close after 5 seconds if desired
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-muted-foreground mb-6">
          {description || 'This feature is coming soon. Stay tuned for updates!'}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm text-foreground">Feature under development</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm text-foreground">Full functionality coming soon</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-sm text-foreground">Be the first to know about updates</span>
          </div>
        </div>

        <Button
          onClick={handleClose}
          className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}
