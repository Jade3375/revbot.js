import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { BaseClient } from "../client/baseClient";
import { apiUrl } from "../utils";
import { version } from "../../package.json";
import { RateLimitQueue } from "./restUtils/rateLimitQueue";

export class RestClient {
  private rateLimitQueue = new RateLimitQueue();
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
    body?: any,
    query?: Record<string, string | number>,
  ): Promise<T> {
    try {
      if (!this.client.token) throw new Error("Token is required");

      const authHeader = this.client.bot ? "X-Bot-Token" : "X-Session-Token";
      const config: AxiosRequestConfig & { url: string } = {
        ...{
          method,
          url: `${apiUrl}${url}`,
          params: query,
          data: body?.body,
          headers: {
            [authHeader]: this.client.token,
            "User-Agent": `RevBot.js/${version}`,
          },
        },
        url: `${apiUrl}${url}`,
      };

      // Use the rate limit queue for all requests
      const response: AxiosResponse<T> =
        await this.rateLimitQueue.request<T>(config);
      return response.data;
    } catch (error) {
      console.error("API call failed:", error);
      throw error;
    }
  }

  /**
   * GET request.
   * @param url The URL for the request.
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  async get<T>(
    url: string,
    query?: Record<string, string | number>,
  ): Promise<T> {
    return this.request<T>("GET", url, undefined, query);
  }

  /**
   * POST request.
   * @param url The URL for the request.
   * @param body The request body.
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  async post<T>(
    url: string,
    body: any,
    query?: Record<string, string | number>,
  ): Promise<T> {
    return this.request<T>("POST", url, body, query);
  }

  /**
   * PATCH request.
   * @param url The URL for the request.
   * @param body The request body.
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  async patch<T>(
    url: string,
    body: any,
    query?: Record<string, string | number>,
  ): Promise<T> {
    return this.request<T>("PATCH", url, body, query);
  }

  /**
   * PUT request.
   * @param url The URL for the request.
   * @param body The request body.
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  async put<T>(
    url: string,
    body?: any,
    query?: Record<string, string | number>,
  ): Promise<T> {
    return this.request<T>("PUT", url, body, query);
  }

  /**
   * DELETE request.
   * @param url The URL for the request.
   * @param query Query parameters (if applicable).
   * @returns The API response.
   */
  async delete<T>(
    url: string,
    body?: any,
    query?: Record<string, string | number>,
  ): Promise<T> {
    return this.request<T>("DELETE", url, body, query);
  }
}
