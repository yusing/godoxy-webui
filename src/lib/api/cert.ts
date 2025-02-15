import { fetchEndpoint } from "@/types/api/endpoints";

export type CertInfo = {
  subject: string;
  issuer: string;
  not_before: number;
  not_after: number;
  dns_names?: string[];
  email_addresses?: string[];
};

const endpointInfo = "/api/cert/info";
const endpointRenew = "/api/cert/renew";

export async function fetchCertInfo(): Promise<CertInfo> {
  return fetchEndpoint(endpointInfo).then((res) => res?.json());
}

export function renewCert() {
  return new WebSocket(endpointRenew);
}
