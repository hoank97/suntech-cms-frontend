export const APIS = {
    AUTH: {
        LOGIN: () => `api/v1/login`,
    },
    USER: {
        PROFILE: () => `api/v1/profile`
    },
    CATEGORY: {
        LIST: (options: { page: number, limit: number, q?: string, type?: string }) => `category/list?page=${options.page}&limit=${options.limit}&q=${options.q}&type=${options.type ?? ''}`,
        CREATE: () => `category`,
        UPDATE: (id: string) => `category/${id}`,
        DETAIL: (id: string) => `category/${id}`,
        GET_ALL: () => `category`,
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
    UPLOAD: () => `upload/image`,
    IMAGE: {
        SMALL: (id: string) => `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${id}?size=small`,
        MEDIUM: (id: string) => `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${id}?size=medium`,
        LARGE: (id: string) => `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${id}?size=large`
    }
}