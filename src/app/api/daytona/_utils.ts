// Central Daytona API proxy utilities (server-side only)
import { NextRequest } from "next/server";

type DaytonaMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS";

export function getConfig() {
  // Use the correct Daytona cloud API endpoint
  const baseUrl = process.env.DAYTONA_BASE_URL || "https://app.daytona.io/api";
  const apiKey = process.env.DAYTONA_API_KEY || process.env.NEXT_PUBLIC_DAYTONA_API_KEY || "";
  
  console.log("[Daytona Config] Base URL:", baseUrl);
  console.log("[Daytona Config] API Key available:", !!apiKey);
  console.log("[Daytona Config] API Key preview:", apiKey ? `${apiKey.substring(0, 8)}...` : "none");
  
  return { baseUrl, apiKey };
}

export async function daytonaFetch<T = any>(
  endpoint: string,
  method: DaytonaMethod,
  body?: unknown,
  init?: RequestInit
): Promise<T> {
  const { baseUrl, apiKey } = getConfig();
  const url = `${baseUrl.replace(/\/$/, "")}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (apiKey) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${apiKey}`;
  }

  console.log("[Daytona Proxy] →", method, url);

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Server-side; no CORS issues
    ...init,
  });

  const text = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  
  console.log("[Daytona Proxy] ←", res.status, res.statusText);
  console.log("[Daytona Proxy] Content-Type:", res.headers.get("content-type"));
  console.log("[Daytona Proxy] Response length:", text.length);
  
  if (!res.ok) {
    console.error("[Daytona Proxy] ✖", res.status, text.substring(0, 500) + (text.length > 500 ? "..." : ""));
    
    // Return a more user-friendly error for common issues
    if (res.status === 401) {
      throw new Error("Daytona API authentication failed. Please check your API key with 'daytona server api-key generate'.");
    } else if (res.status === 403) {
      throw new Error("Daytona API access forbidden. Please check your API key permissions.");
    } else if (res.status === 404) {
      throw new Error(`Daytona API endpoint '${endpoint}' not found. The API may use different endpoint paths.`);
    } else {
      throw new Error(`Daytona API error ${res.status}: ${res.statusText}`);
    }
  }
  
  const payload = isJson && text ? JSON.parse(text) : (text as unknown);
  console.log("[Daytona Proxy] ✓ Success, response type:", typeof payload);
  return payload as T;
}

export async function readRequestJson<T = any>(req: NextRequest): Promise<T> {
  try {
    const data = await req.json();
    return data as T;
  } catch {
    return {} as T;
  }
}


