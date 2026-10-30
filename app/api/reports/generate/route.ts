import { NextRequest, NextResponse } from "next/server";
import {
  getGmailAccessToken,
  gmailErrorResponse,
  unauthorizedGmailResponse,
} from "@/lib/gmail-route";
import { getLabels, getMessages, type GmailMessage } from "@/lib/gmail";
import { createReportFile } from "@/lib/report-files";
import type {
  GeneratedReport,
  ReportFilter,
  ReportFormat,
  ReportGenerateRequest,
  ReportPeriod,
} from "@/lib/reports";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const maxReportMessages = 1000;
const reportFilters = new Set<ReportFilter>([
  "all",
  "unread",
  "starred",
  "important",
  "attachment",
]);
const reportFormats = new Set<ReportFormat>(["pdf", "csv", "json"]);
const subjectStopWords = new Set([
  "the", "and", "for", "with", "from", "your", "you", "this", "that", "have",
  "has", "are", "was", "will", "not", "our", "per", "dan", "yang", "untuk",
  "dari", "pada", "atau", "ini", "itu", "sudah", "dengan", "email",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isReportFilter(value: unknown): value is ReportFilter {
  return typeof value === "string" && reportFilters.has(value as ReportFilter);
}

function isReportFormat(value: unknown): value is ReportFormat {
  return typeof value === "string" && reportFormats.has(value as ReportFormat);
}

function nextDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10).replace(/-/g, "/");
}

function escapeLabelName(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function filterQuery(filter: ReportFilter) {
  switch (filter) {
    case "unread":
      return "is:unread";
    case "starred":
      return "is:starred";
    case "important":
      return "is:important";
    case "attachment":
      return "has:attachment";
    default:
      return "";
  }
}

function subjectWords(subject: string) {
  return subject
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !subjectStopWords.has(word));
}

function aggregateReport(
  request: ReportGenerateRequest,
  labelName: string | null,
  messages: GmailMessage[],
  labelNames: Map<string, string>,
  truncated: boolean,
): GeneratedReport {
  const senders = new Map<string, { name: string; email: string; count: number }>();
  const days = new Map<string, number>();
  const labels = new Map<string, number>();
  const keywords = new Map<string, number>();
  let unread = 0;
  let starred = 0;
  let important = 0;

  for (const message of messages) {
    if (message.labels.includes("UNREAD")) unread += 1;
    if (message.labels.includes("STARRED")) starred += 1;
    if (message.labels.includes("IMPORTANT")) important += 1;

    const senderKey = message.sender.email.toLowerCase() || message.from;
    if (senderKey) {
      const current = senders.get(senderKey);
      senders.set(senderKey, {
        name: current?.name || message.sender.name || message.sender.email || "Unknown",
        email: message.sender.email,
        count: (current?.count ?? 0) + 1,
      });
    }

    if (message.date) {
      const date = new Date(message.date);
      if (!Number.isNaN(date.getTime())) {
        const key = date.toISOString().slice(0, 10);
        days.set(key, (days.get(key) ?? 0) + 1);
      }
    }

    for (const label of new Set(message.labels)) {
      labels.set(label, (labels.get(label) ?? 0) + 1);
    }
    for (const word of new Set(subjectWords(message.subject))) {
      keywords.set(word, (keywords.get(word) ?? 0) + 1);
    }
  }

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    period: request.period,
    format: request.format,
    labelName,
    filter: request.filter,
    truncated,
    summary: { total: messages.length, unread, starred, important },
    perSender: [...senders.values()]
      .sort((first, second) => second.count - first.count)
      .slice(0, 20),
    perDay: [...days]
      .map(([date, count]) => ({ date, count }))
      .sort((first, second) => first.date.localeCompare(second.date)),
    perLabel: [...labels]
      .map(([id, count]) => ({ id, name: labelNames.get(id) ?? id, count }))
      .sort((first, second) => second.count - first.count),
    topKeywords: [...keywords]
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 20),
  };
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  const accessToken = await getGmailAccessToken(request);
  if (!accessToken) return unauthorizedGmailResponse();

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Body JSON tidak valid." } },
      { status: 400 },
    );
  }

  if (!isRecord(rawBody) || !isRecord(rawBody.period)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_PERIOD",
          message: "Periode tanggal tidak valid.",
        },
      },
      { status: 400 },
    );
  }
  const periodValue = rawBody.period;
  if (
    !isValidDate(periodValue.startDate) ||
    !isValidDate(periodValue.endDate) ||
    periodValue.startDate > periodValue.endDate
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_PERIOD", message: "Periode tanggal tidak valid." } },
      { status: 400 },
    );
  }
  if (!isReportFilter(rawBody.filter) || !isReportFormat(rawBody.format)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_OPTIONS",
          message: "Filter atau format laporan tidak didukung.",
        },
      },
      { status: 400 },
    );
  }
  if (
    rawBody.labelId !== undefined &&
    typeof rawBody.labelId !== "string"
  ) {
    return NextResponse.json(
      { error: { code: "INVALID_LABEL", message: "Label tidak valid." } },
      { status: 400 },
    );
  }

  const body: ReportGenerateRequest = {
    period: {
      startDate: periodValue.startDate,
      endDate: periodValue.endDate,
    } satisfies ReportPeriod,
    filter: rawBody.filter,
    format: rawBody.format,
    labelId: typeof rawBody.labelId === "string" ? rawBody.labelId : undefined,
  };

  try {
    const labels = await getLabels(accessToken);
    const selectedLabel = body.labelId
      ? labels.find((label) => label.id === body.labelId)
      : undefined;
    if (body.labelId && !selectedLabel) {
      return NextResponse.json(
        { error: { code: "LABEL_NOT_FOUND", message: "Label Gmail tidak ditemukan." } },
        { status: 400 },
      );
    }

    const queryTerms = [
      `after:${body.period.startDate.replace(/-/g, "/")}`,
      `before:${nextDate(body.period.endDate)}`,
      filterQuery(body.filter),
    ];
    if (selectedLabel) {
      const systemLabelQuery: Record<string, string> = {
        INBOX: "in:inbox",
        SENT: "in:sent",
        TRASH: "in:trash",
        SPAM: "in:spam",
        STARRED: "is:starred",
        UNREAD: "is:unread",
        IMPORTANT: "is:important",
        CATEGORY_PERSONAL: "category:primary",
        CATEGORY_SOCIAL: "category:social",
        CATEGORY_PROMOTIONS: "category:promotions",
        CATEGORY_UPDATES: "category:updates",
        CATEGORY_FORUMS: "category:forums",
      };
      queryTerms.push(
        systemLabelQuery[selectedLabel.id] ??
          `label:"${escapeLabelName(selectedLabel.name)}"`,
      );
    }
    const query = queryTerms.filter(Boolean).join(" ");

    const messages = [];
    let pageToken: string | undefined;
    let truncated = false;
    do {
      const remaining = maxReportMessages - messages.length;
      if (remaining <= 0) {
        truncated = Boolean(pageToken);
        break;
      }

      const page = await getMessages(accessToken, {
        maxResults: Math.min(100, remaining),
        query,
        pageToken,
      });
      messages.push(...page.messages);
      pageToken = page.nextPageToken;
      if (!pageToken || messages.length >= maxReportMessages) {
        truncated = Boolean(pageToken);
        break;
      }
    } while (pageToken);

    const report = aggregateReport(
      body,
      selectedLabel?.name ?? null,
      messages,
      new Map(labels.map((label) => [label.id, label.name])),
      truncated,
    );
    const blob = createReportFile(report, body.format);
    const fileBuffer = Buffer.from(await blob.arrayBuffer());
    const mimeType =
      body.format === "pdf"
        ? "application/pdf"
        : body.format === "csv"
          ? "text/csv;charset=utf-8"
          : "application/json;charset=utf-8";
    const extension = body.format;
    const fileName = `gmailreporter-${report.period.startDate}-${report.period.endDate}.${extension}`;

    return NextResponse.json({
      report,
      fileName,
      mimeType,
      downloadUrl: `data:${mimeType};base64,${fileBuffer.toString("base64")}`,
    });
  } catch (error) {
    return gmailErrorResponse(error);
  }
}
