import "server-only";
import { parseSender, type Sender } from "@/lib/gmail-helpers";

export { countByLabel, groupByDate, parseSender } from "@/lib/gmail-helpers";

export type GmailMessage = {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  sender: Sender;
  snippet: string;
  labels: string[];
  date: string;
  internalDate: string | null;
};

export type GmailMessageList = {
  messages: GmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
};

export type GmailMessageDetail = GmailMessage & {
  body: string;
};

export type GmailMessageOptions = {
  maxResults?: number;
  query?: string;
  pageToken?: string;
};

export type GmailProfile = {
  email: string;
  totalMessages: number;
  totalThreads: number;
};

export type GmailLabel = {
  id: string;
  name: string;
  type: "system" | "user";
  messagesTotal?: number;
  messagesUnread?: number;
};

export type { Sender } from "@/lib/gmail-helpers";

type GmailHeader = {
  name: string;
  value: string;
};

type GmailMessageResource = {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  internalDate?: string;
  payload?: {
    headers?: GmailHeader[];
    mimeType?: string;
    body?: {
      data?: string;
    };
    parts?: GmailMessageResource["payload"][];
  };
};

type GmailMessageListResource = {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

type GmailProfileResource = {
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
};

type GmailLabelsResource = {
  labels?: Array<{
    id: string;
    name: string;
    type: "system" | "user";
    messagesTotal?: number;
    messagesUnread?: number;
  }>;
};

export class GmailApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "GmailApiError";
  }
}

const gmailApiBase = "https://gmail.googleapis.com/gmail/v1/users/me";

async function gmailRequest<T>(
  accessToken: string,
  path: string,
  params?: URLSearchParams,
): Promise<T> {
  const url = new URL(`${gmailApiBase}${path}`);
  if (params) {
    url.search = params.toString();
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Gmail API request failed (${response.status}).`;
    try {
      const body = (await response.json()) as {
        error?: { message?: string; status?: string };
      };
      message = body.error?.message || message;
    } catch {
      // Keep the status-based message when Gmail does not return JSON.
    }

    throw new GmailApiError(
      message,
      response.status,
      response.status === 401 ? "GMAIL_UNAUTHORIZED" : "GMAIL_API_ERROR",
    );
  }

  return (await response.json()) as T;
}

function getHeader(headers: GmailHeader[] | undefined, name: string): string {
  return (
    headers?.find((header) => header.name.toLowerCase() === name.toLowerCase())
      ?.value ?? ""
  );
}

function messageFromResource(resource: GmailMessageResource): GmailMessage {
  const headers = resource.payload?.headers;
  const from = getHeader(headers, "From");
  const internalDate = resource.internalDate ?? null;
  const headerDate = getHeader(headers, "Date");
  const parsedDate = internalDate
    ? new Date(Number(internalDate))
    : new Date(headerDate);

  return {
    id: resource.id,
    threadId: resource.threadId,
    subject: getHeader(headers, "Subject") || "(Tanpa subjek)",
    from,
    to: getHeader(headers, "To"),
    sender: parseSender(from),
    snippet: resource.snippet ?? "",
    labels: resource.labelIds ?? [],
    date: Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString(),
    internalDate,
  };
}

function decodeMessagePart(resource: GmailMessageResource): string[] {
  const payload = resource.payload;
  if (!payload) return [];

  const childBodies = (payload.parts ?? []).flatMap((part) =>
    decodeMessagePart({ id: resource.id, threadId: resource.threadId, payload: part }),
  );
  if (childBodies.length > 0) return childBodies;

  const data = payload.body?.data;
  if (!data || !payload.mimeType?.startsWith("text/")) return [];

  const decoded = Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64")
    .toString("utf8");
  if (payload.mimeType === "text/html") {
    return [
      decoded
        .replace(/<\s*br\s*\/?>/gi, "\n")
        .replace(/<\/\s*(p|div|li|tr|h[1-6])\s*>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .trim(),
    ];
  }

  return [decoded];
}

export async function getMessageById(
  accessToken: string,
  id: string,
): Promise<GmailMessage> {
  if (!id.trim()) {
    throw new GmailApiError("Message ID wajib diisi.", 400, "INVALID_MESSAGE_ID");
  }

  const params = new URLSearchParams({ format: "metadata" });
  for (const header of ["Subject", "From", "To", "Date"]) {
    params.append("metadataHeaders", header);
  }

  const resource = await gmailRequest<GmailMessageResource>(
    accessToken,
    `/messages/${encodeURIComponent(id)}`,
    params,
  );
  return messageFromResource(resource);
}

export async function getMessageDetailById(
  accessToken: string,
  id: string,
): Promise<GmailMessageDetail> {
  if (!id.trim()) {
    throw new GmailApiError("Message ID wajib diisi.", 400, "INVALID_MESSAGE_ID");
  }

  const resource = await gmailRequest<GmailMessageResource>(
    accessToken,
    `/messages/${encodeURIComponent(id)}`,
    new URLSearchParams({ format: "full" }),
  );
  const bodies = decodeMessagePart(resource);
  const body =
    bodies.find((part) => part.trim()) ??
    resource.snippet ??
    "Isi pesan tidak tersedia.";

  return { ...messageFromResource(resource), body };
}

export async function getMessages(
  accessToken: string,
  { maxResults = 20, query, pageToken }: GmailMessageOptions = {},
): Promise<GmailMessageList> {
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 100) {
    throw new GmailApiError(
      "maxResults harus berupa bilangan bulat antara 1 dan 100.",
      400,
      "INVALID_MAX_RESULTS",
    );
  }

  const params = new URLSearchParams({
    maxResults: String(maxResults),
  });
  if (query?.trim()) {
    params.set("q", query.trim());
  }
  if (pageToken) {
    params.set("pageToken", pageToken);
  }

  const result = await gmailRequest<GmailMessageListResource>(
    accessToken,
    "/messages",
    params,
  );
  const messageRefs = result.messages ?? [];
  const messages: GmailMessage[] = [];

  for (let index = 0; index < messageRefs.length; index += 10) {
    const batch = messageRefs.slice(index, index + 10);
    const details = await Promise.all(
      batch.map(({ id }) => getMessageById(accessToken, id)),
    );
    messages.push(...details);
  }

  return {
    messages,
    nextPageToken: result.nextPageToken,
    resultSizeEstimate: result.resultSizeEstimate ?? messages.length,
  };
}

export async function getProfile(accessToken: string): Promise<GmailProfile> {
  const profile = await gmailRequest<GmailProfileResource>(accessToken, "/profile");
  return {
    email: profile.emailAddress ?? "",
    totalMessages: profile.messagesTotal ?? 0,
    totalThreads: profile.threadsTotal ?? 0,
  };
}

export async function getLabels(accessToken: string): Promise<GmailLabel[]> {
  const result = await gmailRequest<GmailLabelsResource>(accessToken, "/labels");
  return result.labels ?? [];
}
