import Endpoints, { fetchEndpoint } from "./endpoints";

type Credentials = {
  username: string;
  password: string;
};

export function login(credentials: Credentials) {
  return fetchEndpoint(Endpoints.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}
