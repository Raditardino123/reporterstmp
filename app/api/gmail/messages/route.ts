import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/lib/gmail";
import {
  getGmailAccessToken,
  gmailErrorResponse,
  unauthorizedGmailResponse,
} from "@/lib/gmail-route";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const accessToken = await getGmailAccessToken(request);
  if (!accessToken) {
    return unauthorizedGmailResponse();
  }

  const params = request.nextUrl.searchParams;
  const rawMaxResults = params.get("maxResults");
  const maxResults = rawMaxResults === null ? 20 : Number(rawMaxResults);

  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 100) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_MAX_RESULTS",
          message: "maxResults harus berupa bilangan bulat antara 1 dan 100.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const data = await getMessages(accessToken, {
      maxResults,
      query: params.get("query") ?? undefined,
      pageToken: params.get("pageToken") ?? undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    return gmailErrorResponse(error);
  }
}
