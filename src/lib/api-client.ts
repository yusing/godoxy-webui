/* eslint-disable @typescript-eslint/no-explicit-any */
import { Api, type ErrorResponse } from "@/lib/api";
import { AxiosError, type AxiosResponse } from "axios";
import { logger } from "./logger";

export const api = new Api({
  baseURL: "/api/v1",
  secure: process.env.NODE_ENV === "production",
  format: "json",
});

export type ApiResponse<Data> =
  | {
      data: Data;
      code: number;
      headers: AxiosResponse["headers"];
      error: null;
    }
  | {
      data: null;
      code: number;
      headers: AxiosResponse["headers"];
      error: ErrorResponse;
    };

type ApiMethodParams<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => unknown
  ? P
  : never;

type ApiMethodData<T extends (...args: any[]) => any> = T extends (
  ...args: any[]
) => Promise<AxiosResponse<infer D>>
  ? D
  : never;

function getError(data: ErrorResponse | string) {
  if (typeof data === "object") {
    return data;
  }
  return { message: data };
}

export async function callApi<
  Fn extends (...args: any[]) => Promise<AxiosResponse<any>>,
>(
  fn: Fn,
  ...args: ApiMethodParams<Fn>
): Promise<ApiResponse<ApiMethodData<Fn>>> {
  try {
    logger.debug("callApi", fn.name);
    const { data, status, headers } = await fn(...args);
    if (status >= 200 && status < 300) {
      return {
        data: data,
        code: status,
        error: null,
        headers: headers,
      };
    }
    logger.error("callApi", fn.name, status, data);
    return {
      data: null,
      code: status,
      error: getError(data),
      headers: headers,
    };
  } catch (e) {
    if (e instanceof AxiosError) {
      logger.error("callApi", fn.name, e.response?.status, e.response?.data);
      return {
        data: null,
        code: e.response?.status ?? 500,
        error: getError(e.response?.data),
        headers: e.response?.headers ?? {},
      };
    }
    logger.error("callApi", fn.name, e);
    return {
      data: null,
      code: 500,
      error: { message: "Unknown error" },
      headers: {},
    };
  }
}
