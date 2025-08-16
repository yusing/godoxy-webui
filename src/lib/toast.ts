import { toaster } from "@/components/ui/toaster";
import { AxiosError } from "axios";
import type { ErrorResponse } from "./api";

export function toastError<T>(error: T) {
  if (error instanceof AxiosError) {
    const asResponseError = error.response?.data as ErrorResponse;
    if (asResponseError && (asResponseError.error || asResponseError.message)) {
      toaster.error({
        title: asResponseError.message ?? asResponseError.error,
        description: asResponseError.error ?? asResponseError.message,
      });
    } else {
      toaster.error({
        title: `HTTP Error ${error.response?.status ?? "unknown"}`,
        description: JSON.stringify(error.response?.data),
      });
    }
  } else if (error instanceof Error) {
    toaster.error({
      title: "HTTP Error",
      description: error.message,
    });
  } else if (error instanceof Event) {
    toaster.error({ title: "Websocket error" });
  } else {
    const asError = error as ErrorResponse;
    if (asError.error || asError.message) {
      toaster.error({
        title: asError.message ?? asError.error,
        description: asError.error ?? asError.message,
      });
    } else {
      toaster.error({
        title: "Unknown error",
        description: JSON.stringify(error),
      });
      console.error(error, `unknown error type ${typeof error}`);
    }
  }
}
