export const APIS = {
    AUTH: {
        LOGIN: () => `api/v1/login`,
        CHANGE_PASSWORD: () => `api/v1/user/change-password`,
    },
    USER: {
        PROFILE: () => `api/v1/profile`,
        LIST: (options: { page: number, limit: number, q?: string }) => `api/v1/users?page=${options.page}&limit=${options.limit}&q=${options.q || ''}`,
    },
    CATEGORY: {
        LIST: (options: { page: number, limit: number, q?: string, type?: string }) => `category/list?page=${options.page}&limit=${options.limit}&q=${options.q}&type=${options.type ?? ''}`,
        CREATE: () => `category`,
        UPDATE: (id: string) => `category/${id}`,
        DETAIL: (id: string) => `category/${id}`,
        GET_ALL: (type?: string) => `category?type=${type ? type : ''}`,
        DELETE: (id: number | string) => `category/${id}`
    },
    INDUSTRY: {
        LIST: (options: { page: number, limit: number, q?: string }) => `industry/list?page=${options.page}&limit=${options.limit}&q=${options.q}`,
        CREATE: () => `industry`,
        UPDATE: (id: string) => `industry/${id}`,
        DETAIL: (id: string) => `industry/${id}`,
        GET_ALL: () => `industry`,
        DELETE: (id: number | string) => `industry/${id}`
    },
    PRODUCT: {
        LIST: (options: { page: number, limit: number, q?: string }) => `product/list?page=${options.page}&limit=${options.limit}&q=${options.q}`,
        CREATE: () => `product`,
        UPDATE: (id: string) => `product/${id}`,
        DETAIL: (id: string) => `product/${id}`,
        GET_ALL: () => `product`,
        DELETE: (id: number | string) => `product/${id}`
    },
    POST: {
        LIST: (options: { page: number, limit: number, q?: string }) => `post/list?page=${options.page}&limit=${options.limit}&q=${options.q}`,
        CREATE: () => `post`,
        UPDATE: (id: string) => `post/${id}`,
        DETAIL: (id: string) => `post/${id}`,
        GET_ALL: () => `post`,
        DELETE: (id: number | string) => `post/${id}`
    },
    UPLOAD: () => `upload/image`,
    UPLOAD_DOCUMENT: () => `upload/document`,
    IMAGE: {
        SMALL: (id: string) => `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${id}?size=small`,
        MEDIUM: (id: string) => `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${id}?size=medium`,
        LARGE: (id: string) => `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${id}?size=large`
    },
    DASHBOARD: '/dashboard/stats'
}