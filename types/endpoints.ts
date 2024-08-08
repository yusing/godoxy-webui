
namespace Endpoints {
    export const FileContent = (filename: string) => `/file/${filename}`;
    export const LIST_CONFIG_FILES = '/list/config_files';
    export const LIST_PROXIES = '/list/routes';
    export const STATS = '/stats';
};

type FetchArguments = {
    query?: Record<string, any>,
    headers?: HeadersInit,
    body?: BodyInit,
    signal?: AbortSignal
    method?: "GET" | "POST" | "PUT" | "DELETE"
}

export type FetchError = {
    status: number
    statusText: string
    content: string
}

export function formatError(error: string | Error | FetchError) {
    if (typeof error === 'string') {
        return error;
    } else if (error instanceof Error) {
        return error.message;
    } else {
        return `${error.status} - ${error.statusText}\n${error.content}`;
    }
}

export async function fetchEndpoint(endpoint: string, args: FetchArguments = {}) {
    // see proxy in vite.config.ts
    endpoint = `/api${endpoint}`;
    if (args.query) {
        endpoint += `?${new URLSearchParams(args.query)}`
    }
    if (process.env.NODE_ENV === 'development') {
        console.log(`fetch: ${endpoint}, args:\n ${JSON.stringify(args)}`);
    }
    return await fetch(endpoint, { signal: args.signal, headers: args.headers, method: args.method, body: args.body });
}

export async function checkResponse(resp: Response) {
    if (!resp.ok) throw { status: resp.status, statusText: resp.statusText, content: await resp.text() };
}

export default Endpoints;