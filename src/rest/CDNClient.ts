import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BaseClient } from "../client/baseClient";
import { cdnUrl } from "../utils";
import { version } from "../../package.json";
import FormData from "form-data";
export class CDNClient {
  constructor(private readonly client: BaseClient) {}

  /**
   * Helper function to handle API requests.
   * @param method The HTTP method (GET, POST, PATCH, PUT, DELETE).
   * @param url The URL for the request.
   * @param body The request body (if applicable).
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  private async request<T>(
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
    url: string,
    data: FormData,
    query?: Record<string, string | number>,
  ): Promise<T> {
    try {
      if (!this.client.token) throw new Error("Token is required");

      const config: AxiosRequestConfig = {
        method,
        url: `${cdnUrl}${url}`,
        params: query,
        data,
        maxBodyLength: Infinity,
        headers: {
          "X-Bot-Token": this.client.token,
          "Content-Type": "multipart/form-data",
          "User-Agent": `RevBot.js/${version}`,
          ...data.getHeaders(),
        },
      };

      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  /**
   * POST request.
   * @param url The URL for the request.
   * @param data The request body.
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  async post<T>(url: string, data: FormData): Promise<T> {
    return this.request<T>("POST", url, data);
  }
}
