export enum CategoryType {
    PRODUCT = 'product',
    INDUSTRY = 'industry',
}

export interface Category {
    id: number;
    name_en: string;
    name_vi: string;
    img_url?: string;
    parent_id?: number | null;
    type: CategoryType;
    status: 'active' | 'inactive';
}
