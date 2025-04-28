import { URL } from "../types";

export type ProxmoxConfig = {
  url: URL;
  token_id: string;
  secret: string;
  no_tls_verify?: boolean;
};
