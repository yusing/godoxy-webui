import Endpoints, { fetchEndpoint } from "./api/endpoints";

type Credentials = {
  username: string;
  password: string;
};

export function login(credentials: Credentials) {
  return fetchEndpoint(Endpoints.AUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
}
