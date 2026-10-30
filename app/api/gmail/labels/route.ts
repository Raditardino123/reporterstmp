import { NextRequest, NextResponse } from "next/server";
import { getLabels } from "@/lib/gmail";
import {
  getGmailAccessToken,
  gmailErrorResponse,
  unauthorizedGmailResponse,
} from "@/lib/gmail-route";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const accessToken = await getGmailAccessToken(request);
  if (!accessToken) {
    return unauthorizedGmailResponse();
  }

  try {
    const labels = await getLabels(accessToken);
    return NextResponse.json({ labels });
  } catch (error) {
    return gmailErrorResponse(error);
  }
}
