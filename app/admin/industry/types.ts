export interface Industry {
    id: number;
    name_en: string;
    name_vi: string;
    image_url?: string;
    parent_id?: number | null;
    introduction_en: string;
    introduction_vi: string;
    applications_en: string[];
    applications_vi: string[];
    solution_link?: string;
    created_at?: string;
    updated_at?: string;
}
