export interface Post {
    id: number;
    title_en: string;
    title_vi: string;
    content_en: string;
    content_vi: string;
    thumbnail_url: string;
    published_at: string;
    created_by: string;
    created_at?: string;
    updated_at?: string;
    views?: number;
}
