'use client';

import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: HeadersInit;
    body?: any;
}

interface UseRequestReturn<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
    request: (url: string, options?: RequestOptions) => Promise<T | undefined>;
    status: number | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

export function useRequest<T = any>(options: { hideToast?: boolean } = {}): UseRequestReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<number | null>(null);
    const hideToast = options.hideToast;

    const { toast } = useToast();

    const request = useCallback(async (url: string, options: RequestOptions = {}) => {
        setLoading(true);
        setError(null);
        setData(null);
        setStatus(null);

        try {
            const token = localStorage.getItem('suntech-x-atk');
            const headers: HeadersInit = {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            };

            let body = options.body;
            if (body && !(body instanceof FormData)) {
                if (!headers['Content-Type' as keyof HeadersInit]) {
                    (headers as Record<string, string>)['Content-Type'] = 'application/json';
                }
                if (typeof body === 'object') {
                    body = JSON.stringify(body);
                }
            }

            const isAbsoluteUrl = url.startsWith('http://') || url.startsWith('https://');
            const fullUrl = isAbsoluteUrl ? url : `${BASE_URL}/${url.replace(/^\/+/, '')}`;

            const response = await fetch(fullUrl, {
                method: options.method || 'GET',
                headers,
                body,
            });
            setStatus(response.status);

            if (!response.ok) {
                let errorMessage = `Error ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch {
                    errorMessage = 'Unknown error occurred';
                }
                !hideToast && toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: errorMessage,
                });
                setError(new Error(errorMessage));
                return;
            }

            try {
                const responseData = await response.json();
                setData(responseData);
                return responseData;
            } catch (err) {
                return {};
            }

        } catch (err: any) {
            const errorMessage = err?.message || 'Unknown error occurred';
            !hideToast && toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
            setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, error, loading, request, status: status };
}
