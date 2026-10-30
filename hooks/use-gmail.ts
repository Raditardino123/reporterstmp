"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  GmailLabel,
  GmailMessageDetail,
  GmailMessageList,
  GmailProfile,
} from "@/lib/gmail";

export type MessagesQueryOptions = {
  maxResults?: number;
  query?: string;
  pageToken?: string;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  };
};

export class GmailClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "GmailClientError";
  }
}

async function fetchGmail<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    let body: ApiErrorResponse = {};
    try {
      body = (await response.json()) as ApiErrorResponse;
    } catch {
      // Use the status-based fallback when the response is not JSON.
    }
    throw new GmailClientError(
      body.error?.message ?? `Permintaan gagal (${response.status}).`,
      response.status,
      body.error?.code,
    );
  }

  return (await response.json()) as T;
}

function shouldRetry(failureCount: number, error: Error) {
  if (error instanceof GmailClientError && error.status < 500) {
    return false;
  }
  return failureCount < 2;
}

export function useMessages(options: MessagesQueryOptions = {}) {
  const { maxResults = 20, query = "", pageToken } = options;

  return useQuery({
    queryKey: ["gmail", "messages", { maxResults, query, pageToken }],
    queryFn: () => {
      const params = new URLSearchParams({ maxResults: String(maxResults) });
      if (query.trim()) params.set("query", query.trim());
      if (pageToken) params.set("pageToken", pageToken);
      return fetchGmail<GmailMessageList>(`/api/gmail/messages?${params}`);
    },
    retry: shouldRetry,
  });
}

export function useMessageById(id: string | null) {
  return useQuery({
    queryKey: ["gmail", "message", id],
    queryFn: () =>
      fetchGmail<GmailMessageDetail>(
        `/api/gmail/messages/${encodeURIComponent(id!)}`,
      ),
    enabled: Boolean(id),
    retry: shouldRetry,
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["gmail", "profile"],
    queryFn: () => fetchGmail<GmailProfile>("/api/gmail/profile"),
    staleTime: 5 * 60 * 1000,
    retry: shouldRetry,
  });
}

export function useLabels() {
  return useQuery({
    queryKey: ["gmail", "labels"],
    queryFn: async () => {
      const result = await fetchGmail<{ labels: GmailLabel[] }>("/api/gmail/labels");
      return result.labels;
    },
    staleTime: 5 * 60 * 1000,
    retry: shouldRetry,
  });
}
