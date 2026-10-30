export type ReportFormat = "pdf" | "csv" | "json";

export type ReportFilter = "all" | "unread" | "starred" | "important" | "attachment";

export type ReportPeriod = {
  startDate: string;
  endDate: string;
};

export type ReportSenderRow = {
  name: string;
  email: string;
  count: number;
};

export type ReportDayRow = {
  date: string;
  count: number;
};

export type ReportLabelRow = {
  id: string;
  name: string;
  count: number;
};

export type ReportKeywordRow = {
  keyword: string;
  count: number;
};

export type GeneratedReport = {
  id: string;
  createdAt: string;
  period: ReportPeriod;
  format: ReportFormat;
  labelName: string | null;
  filter: ReportFilter;
  truncated: boolean;
  summary: {
    total: number;
    unread: number;
    starred: number;
    important: number;
  };
  perSender: ReportSenderRow[];
  perDay: ReportDayRow[];
  perLabel: ReportLabelRow[];
  topKeywords: ReportKeywordRow[];
};

export type ReportGenerateRequest = {
  period: ReportPeriod;
  labelId?: string;
  filter: ReportFilter;
  format: ReportFormat;
};
