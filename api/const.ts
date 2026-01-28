export const APIS = {
    AUTH: {
        LOGIN: () => `api/v1/login`,
    },
    USER: {
        PROFILE: () => `api/v1/profile`
    },
    CATEGORY: {
        LIST: (options: { page: number, limit: number, q?: string, type?: string }) => `api/v1/categories?page=${options.page}&limit=${options.limit}&q=${options.q}&type=${options.type}`,
        CREATE: () => `api/v1/category`
    },
    UPLOAD: () => `upload/image`
}