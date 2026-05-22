/**
 * Standard SMM panel API client.
 * Most SMM panels (e.g. Peakerr, JustAnotherPanel, SMMKings) expose the same
 * x-www-form-urlencoded contract documented at https://justanotherpanel.com/api
 * and clones thereof. This client encapsulates that contract.
 *
 * All calls log to SmmApiLog via the engine (see /lib/smm-engine.ts).
 */

export type SmmServiceDTO = {
  service: number | string;
  name: string;
  type?: string;
  category?: string;
  rate: string | number;        // per 1000
  min: string | number;
  max: string | number;
  refill?: boolean;
  cancel?: boolean;
  [k: string]: unknown;
};

export type SmmAddOrderDTO = {
  order?: number | string;
  error?: string;
  [k: string]: unknown;
};

export type SmmStatusDTO = {
  charge?: string | number;
  start_count?: string | number;
  status?: string;
  remains?: string | number;
  currency?: string;
  error?: string;
  [k: string]: unknown;
};

export type SmmBalanceDTO = {
  balance?: string | number;
  currency?: string;
  error?: string;
  [k: string]: unknown;
};

export class SmmClient {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  private async post<T>(action: string, params: Record<string, unknown> = {}): Promise<{
    ok: boolean;
    data: T | null;
    statusCode: number;
    durationMs: number;
    request: Record<string, unknown>;
    response: unknown;
  }> {
    const body = new URLSearchParams();
    body.set("key", this.apiKey);
    body.set("action", action);
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue;
      body.set(k, String(v));
    }

    const start = Date.now();
    let res: Response;
    try {
      res = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        cache: "no-store",
      });
    } catch (err) {
      return {
        ok: false,
        data: null,
        statusCode: 0,
        durationMs: Date.now() - start,
        request: { action, ...params, key: "***" },
        response: { error: (err as Error).message },
      };
    }

    const durationMs = Date.now() - start;
    const text = await res.text();
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // some panels return non-JSON on error
    }

    const ok = res.ok && !(typeof parsed === "object" && parsed && "error" in (parsed as object));

    return {
      ok,
      data: (parsed as T) ?? null,
      statusCode: res.status,
      durationMs,
      request: { action, ...params, key: "***" },
      response: parsed,
    };
  }

  services() {
    return this.post<SmmServiceDTO[]>("services");
  }

  addOrder(p: { service: string | number; link: string; quantity: number; runs?: number; interval?: number }) {
    return this.post<SmmAddOrderDTO>("add", p);
  }

  status(orderId: string | number) {
    return this.post<SmmStatusDTO>("status", { order: orderId });
  }

  balance() {
    return this.post<SmmBalanceDTO>("balance");
  }

  refill(orderId: string | number) {
    return this.post<{ refill?: number | string; error?: string }>("refill", { order: orderId });
  }
}
