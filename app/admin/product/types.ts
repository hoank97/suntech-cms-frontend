export interface Product {
    id: number;
    name_en: string;
    name_vi: string;
    description_en: string;
    description_vi: string;
    summary_en: string;
    summary_vi: string;
    applications_en: string[];
    applications_vi: string[];
    buy_link?: string;
    documentation_link?: string;
    product_enquiry_link?: string;
    category_id?: number | null;
    category?: {
        id: number;
        name_en: string;
        name_vi: string;
    };
    industry_ids: string[];
    industries?: {
        id: number;
        name_en: string;
        name_vi: string;
    }[];
    download_links: {
        url: string;
        originalName: string;
        size: string;
    }[];
    download_thumb?: string;
    images: string[];
    created_at?: string;
    updated_at?: string;
}
