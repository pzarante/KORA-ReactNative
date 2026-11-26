import { NO_CONNECTION_MESSAGE } from "@/src/core/roble/friendlyError";

const MAX_CONCURRENT_REQUESTS = 2;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1200;

export class ResilientHttpClient {
  private static activeRequests = 0;
  private static readonly waiters: (() => void)[] = [];
  private static readonly inFlightGets = new Map<string, Promise<Response>>();

  static async request(url: string, init: RequestInit = {}): Promise<Response> {
    const method = (init.method ?? "GET").toUpperCase();
    const headers = new Headers(init.headers);
    const dedupeKey = method === "GET"
      ? `${method}:${url}:${headers.get("Authorization") ?? ""}`
      : null;

    if (dedupeKey) {
      const inFlight = this.inFlightGets.get(dedupeKey);
      if (inFlight) return this.cloneResponse(await inFlight);
    }

    const request = this.sendWithRetries(url, init, method);
    if (!dedupeKey) return request;

    this.inFlightGets.set(dedupeKey, request);
    try {
      return this.cloneResponse(await request);
    } finally {
      if (this.inFlightGets.get(dedupeKey) === request) this.inFlightGets.delete(dedupeKey);
    }
  }

  private static async sendWithRetries(url: string, init: RequestInit, method: string): Promise<Response> {
    const retryable = method === "GET" || method === "PUT";
    for (let attempt = 0; ; attempt += 1) {
      let response: Response;
      try {
        await this.acquire();
        try {
          response = await fetch(url, init);
        } finally {
          this.release();
        }
      } catch (error) {
        if (!retryable || attempt >= MAX_RETRIES) {
          // fetch's own text ("Network request failed") would reach the screen otherwise.
          console.warn("Network request failed", url, error);
          throw new Error(NO_CONNECTION_MESSAGE);
        }
        await this.delay(RETRY_DELAY_MS * 2 ** attempt);
        continue;
      }

      if (!retryable || ![500, 502, 503, 504].includes(response.status) || attempt >= MAX_RETRIES) {
        return response;
      }
      await this.delay(RETRY_DELAY_MS * 2 ** attempt);
    }
  }

  private static async acquire(): Promise<void> {
    if (this.activeRequests < MAX_CONCURRENT_REQUESTS) {
      this.activeRequests += 1;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
  }

  private static release(): void {
    const next = this.waiters.shift();
    if (next) next();
    else this.activeRequests -= 1;
  }

  private static cloneResponse(response: Response): Response {
    return typeof response.clone === "function" ? response.clone() : response;
  }

  private static delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
}
