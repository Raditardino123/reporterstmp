import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { GmailApiError } from "@/lib/gmail";

export async function getGmailAccessToken(
  request: NextRequest,
): Promise<string | null> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (typeof token?.accessToken !== "string" || !token.accessToken) {
    return null;
  }

  return token.accessToken;
}

export async function getGmailAccessTokenState(
  request: NextRequest,
): Promise<{ accessToken: string | null; refreshFailed: boolean }> {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  return {
    accessToken:
      typeof token?.accessToken === "string" ? token.accessToken : null,
    refreshFailed: token?.error === "RefreshAccessTokenError",
  };
}

export function unauthorizedGmailResponse() {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Silakan masuk kembali." } },
    { status: 401 },
  );
}

export function gmailErrorResponse(error: unknown) {
  if (error instanceof GmailApiError) {
    const status = error.status >= 400 && error.status < 600 ? error.status : 502;
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message:
            status === 401
              ? "Akses Gmail kedaluwarsa. Silakan masuk kembali."
              : error.message,
        },
      },
      { status },
    );
  }

  console.error("Unexpected Gmail API error:", error);
  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Terjadi kesalahan saat mengambil data Gmail.",
      },
    },
    { status: 500 },
  );
}
