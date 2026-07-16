import axios from "axios";
import type { ApiErrorBody } from "../types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://webdev-hw-api-iota.vercel.app/api/fitness",
  
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skyfitness-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    
    console.log("Ошибка API:", error.response?.data);

    const data = error.response?.data;

    if (typeof data === "string") {
      return data;
    }

    return (
      data?.message ??
      data?.error ??
      data?.detail ??
      error.message ??
      "Ошибка при выполнении запроса"
    );
  }

  return error instanceof Error
    ? error.message
    : "Неизвестная ошибка";
}
