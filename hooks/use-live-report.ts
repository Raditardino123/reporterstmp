"use client";

import { useEffect, useState } from "react";

export type LiveReportLog = {
  id: string;
  reportConfigId: string;
  gmailSenderId: string;
  targetEmail: string;
  status: string;
  errorMessage: string | null;
  sentAt: string;
  gmailSender: { email: string };
};

type LiveReportState = {
  logs: LiveReportLog[];
  isConnected: boolean;
  isSending: boolean;
  error: string | null;
};

const MAX_LOG_COUNT = 100;

export function useLiveReport() {
  const [state, setState] = useState<LiveReportState>({
    logs: [],
    isConnected: false,
    isSending: false,
    error: null,
  });

  useEffect(() => {
    const source = new EventSource("/api/reports/live");

    source.onopen = () => {
      setState((current) => ({ ...current, isConnected: true, error: null }));
    };

    source.addEventListener("snapshot", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as {
        logs: LiveReportLog[];
        isSending: boolean;
      };
      setState((current) => ({
        ...current,
        logs: payload.logs.slice(-MAX_LOG_COUNT),
        isSending: payload.isSending,
        error: null,
      }));
    });

    source.addEventListener("logs", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as {
        logs: LiveReportLog[];
      };
      setState((current) => {
        const logsById = new Map(current.logs.map((log) => [log.id, log]));
        for (const log of payload.logs) logsById.set(log.id, log);
        return {
          ...current,
          logs: [...logsById.values()].slice(-MAX_LOG_COUNT),
        };
      });
    });

    source.addEventListener("status", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as {
        isSending: boolean;
      };
      setState((current) => ({ ...current, isSending: payload.isSending }));
    });

    source.addEventListener("error", (event) => {
      if (event instanceof MessageEvent) {
        const payload = JSON.parse(event.data) as { message: string };
        setState((current) => ({ ...current, error: payload.message }));
      } else {
        setState((current) => ({ ...current, isConnected: false }));
      }
    });

    return () => {
      source.close();
    };
  }, []);

  return state;
}
