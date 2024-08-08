import Endpoints, { fetchEndpoint } from "./endpoints";

type ProxyEntriesObject = Record<string, ReverseProxy>;
export type ReverseProxy = Record<string, any>;
export type Stream = Record<string, any>;
export type Column = { key: string, label: string };

export const ReverseProxyColumns = [
    { key: 'alias', label: 'Alias' },
    { key: 'provider', label: 'Provider' },
    { key: 'path', label: 'Path' },
    { key: 'target', label: 'Target' },
]

export const StreamColumns = [
    { key: 'alias', label: 'Alias' },
    { key: 'provider', label: 'Provider' },
    { key: 'scheme', label: 'Scheme' },
    { key: 'host', label: 'Host' },
    { key: 'port', label: 'Port' },
]

export async function getReverseProxies(signal: AbortSignal) {
    const results = await fetchEndpoint(
        Endpoints.LIST_PROXIES, {
        query: { 'type': 'reverse_proxy' },
        signal: signal
    });
    const model = (await results.json()) as ProxyEntriesObject;
    const reverseProxies: ReverseProxy[] = []

    for (const entry of Object.values(model)) {
        for (const subroute of Object.values(entry.subroutes as Record<string, any>)) {
            reverseProxies.push({
                alias: entry.alias,
                provider: entry.provider,
                path: subroute.path,
                target: subroute.targetURL
            });
        }
    }
    return reverseProxies;
}

export async function getStreams(signal: AbortSignal) {
    const results = await fetchEndpoint(
        Endpoints.LIST_PROXIES, {
        query: { 'type': 'stream' },
        signal: signal
    });
    const model = (await results.json()) as ProxyEntriesObject;
    const streams: Stream[] = []

    for (const entry of Object.values(model)) {
        streams.push({
            alias: entry.alias,
            provider: entry.provider,
            scheme: `${entry.scheme.listening} => ${entry.scheme.proxy}`,
            host: entry.host,
            port: `${entry.port.listening} => ${entry.port.proxy}`,
        });
    }
    return streams;
}