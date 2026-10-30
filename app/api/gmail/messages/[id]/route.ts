import { NextRequest, NextResponse } from "next/server";
import { getMessageDetailById } from "@/lib/gmail";
import {
  getGmailAccessToken,
  gmailErrorResponse,
  unauthorizedGmailResponse,
} from "@/lib/gmail-route";
import { rateLimit } from "@/lib/rate-limit";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const limited = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const accessToken = await getGmailAccessToken(request);
  if (!accessToken) {
    return unauthorizedGmailResponse();
  }

  try {
    const message = await getMessageDetailById(accessToken, params.id);
    return NextResponse.json(message);
  } catch (error) {
    return gmailErrorResponse(error);
  }
}
