import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_INTERVAL_MS = 1_000;
const OVERLAP_MS = 2_000;
const MAX_LOGS_PER_POLL = 500;
const INITIAL_LOG_COUNT = 50;

function encodeEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  const ownerEmail = session?.user?.email?.trim().toLowerCase();

  if (!ownerEmail) {
    return NextResponse.json(
      { error: "Silakan masuk terlebih dahulu." },
      { status: 401 },
    );
  }

  const encoder = new TextEncoder();
  let stopped = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (event: string, data: unknown) => {
        if (!stopped) {
          controller.enqueue(encoder.encode(encodeEvent(event, data)));
        }
      };

      const close = () => {
        if (!stopped) {
          stopped = true;
          controller.close();
        }
      };

      const abortStream = () => close();
      _request.signal.addEventListener("abort", abortStream, { once: true });

      void (async () => {
        const seenLogs = new Map<string, number>();
        let lastIsSending: boolean | undefined;
        let nextPollAt = Date.now() - OVERLAP_MS;
        let lastHeartbeatAt = Date.now();

        try {
          const [initialLogs, sendingLog] = await Promise.all([
            prisma.reportLog.findMany({
              where: { gmailSender: { is: { ownerEmail } } },
              select: {
                id: true,
                reportConfigId: true,
                gmailSenderId: true,
                targetEmail: true,
                status: true,
                errorMessage: true,
                sentAt: true,
                gmailSender: { select: { email: true } },
              },
              orderBy: [{ sentAt: "desc" }, { id: "desc" }],
              take: INITIAL_LOG_COUNT,
            }),
            prisma.reportLog.findFirst({
              where: {
                status: "SENDING",
                gmailSender: { is: { ownerEmail } },
              },
              select: { id: true },
            }),
          ]);

          if (stopped) return;

          const snapshot = initialLogs.reverse();
          for (const log of snapshot) {
            seenLogs.set(log.id, log.sentAt.getTime());
          }

          lastIsSending = Boolean(sendingLog);
          enqueue("snapshot", {
            logs: snapshot,
            isSending: lastIsSending,
          });

          while (!stopped) {
            const pollStartedAt = Date.now();
            const since = new Date(nextPollAt);

            const [newLogs, activeLog] = await Promise.all([
              prisma.reportLog.findMany({
                where: {
                  sentAt: { gte: since },
                  gmailSender: { is: { ownerEmail } },
                },
                select: {
                  id: true,
                  reportConfigId: true,
                  gmailSenderId: true,
                  targetEmail: true,
                  status: true,
                  errorMessage: true,
                  sentAt: true,
                  gmailSender: { select: { email: true } },
                },
                orderBy: [{ sentAt: "asc" }, { id: "asc" }],
                take: MAX_LOGS_PER_POLL,
              }),
              prisma.reportLog.findFirst({
                where: {
                  status: "SENDING",
                  gmailSender: { is: { ownerEmail } },
                },
                select: { id: true },
              }),
            ]);

            if (stopped) return;

            const unseenLogs = newLogs.filter((log) => !seenLogs.has(log.id));
            for (const log of unseenLogs) {
              seenLogs.set(log.id, log.sentAt.getTime());
            }

            const pruneBefore = pollStartedAt - OVERLAP_MS;
            for (const [id, sentAt] of seenLogs) {
              if (sentAt < pruneBefore) seenLogs.delete(id);
            }

            if (unseenLogs.length > 0) {
              enqueue("logs", { logs: unseenLogs });
            }

            const isSending = Boolean(activeLog);
            if (isSending !== lastIsSending) {
              lastIsSending = isSending;
              enqueue("status", { isSending });
            }

            if (pollStartedAt - lastHeartbeatAt >= 15_000 && !stopped) {
              controller.enqueue(encoder.encode(": keepalive\n\n"));
              lastHeartbeatAt = pollStartedAt;
            }

            nextPollAt = pollStartedAt - OVERLAP_MS;
            const waitMs = Math.max(
              0,
              POLL_INTERVAL_MS - (Date.now() - pollStartedAt),
            );
            await new Promise((resolve) => setTimeout(resolve, waitMs));
          }
        } catch (error) {
          if (!stopped) {
            console.error("Live report stream failed:", error);
            enqueue("error", {
              message: "Terjadi kesalahan saat memuat pembaruan laporan.",
            });
            close();
          }
        } finally {
          _request.signal.removeEventListener("abort", abortStream);
        }
      })();
    },
    cancel() {
      stopped = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
