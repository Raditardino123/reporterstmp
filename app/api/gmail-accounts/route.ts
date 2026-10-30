import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { encryptGmailAppPassword } from "@/lib/gmail-account-crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

type AccountInput = {
  id?: unknown;
  email?: unknown;
  appPassword?: unknown;
  isActive?: unknown;
};

function isMongoObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getOwnerEmail() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();
  return email || null;
}

async function readJson(request: NextRequest): Promise<AccountInput | null> {
  try {
    const payload: unknown = await request.json();
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload)
    ) {
      return null;
    }

    return payload as AccountInput;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(request, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  const ownerEmail = await getOwnerEmail();
  if (!ownerEmail) return jsonError("Silakan masuk terlebih dahulu.", 401);

  try {
    const accounts = await prisma.gmailAccount.findMany({
      where: { ownerEmail },
      select: { id: true, email: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Could not load Gmail accounts:", error);
    return jsonError("Tidak dapat memuat akun Gmail.", 500);
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const ownerEmail = await getOwnerEmail();
  if (!ownerEmail) return jsonError("Silakan masuk terlebih dahulu.", 401);

  const body = await readJson(request);
  if (!body) return jsonError("Data permintaan tidak valid.", 400);

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const appPassword =
    typeof body.appPassword === "string" ? body.appPassword.trim() : "";

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError("Masukkan alamat email Gmail yang valid.", 400);
  }

  if (!/^\d{16}$/.test(appPassword)) {
    return jsonError("App Password harus tepat 16 digit.", 400);
  }

  try {
    const account = await prisma.gmailAccount.create({
      data: {
        ownerEmail,
        email,
        appPassword: encryptGmailAppPassword(appPassword),
      },
      select: { id: true, email: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("Akun Gmail ini sudah terdaftar.", 409);
    }

    console.error("Could not add Gmail account:", error);
    return jsonError("Tidak dapat menyimpan akun Gmail.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  const ownerEmail = await getOwnerEmail();
  if (!ownerEmail) return jsonError("Silakan masuk terlebih dahulu.", 401);

  const body = await readJson(request);
  if (
    !body ||
    typeof body.id !== "string" ||
    !isMongoObjectId(body.id) ||
    typeof body.isActive !== "boolean"
  ) {
    return jsonError("ID akun dan status aktif yang valid wajib diisi.", 400);
  }

  try {
    const result = await prisma.gmailAccount.updateMany({
      where: { id: body.id, ownerEmail },
      data: { isActive: body.isActive },
    });

    if (result.count === 0) {
      return jsonError("Akun Gmail tidak ditemukan.", 404);
    }

    return NextResponse.json({
      account: { id: body.id, isActive: body.isActive },
    });
  } catch (error) {
    console.error("Could not update Gmail account:", error);
    return jsonError("Tidak dapat mengubah status akun Gmail.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const limited = rateLimit(request, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const ownerEmail = await getOwnerEmail();
  if (!ownerEmail) return jsonError("Silakan masuk terlebih dahulu.", 401);

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !isMongoObjectId(id)) {
    return jsonError("ID akun yang valid wajib diisi.", 400);
  }

  try {
    const result = await prisma.gmailAccount.deleteMany({
      where: { id, ownerEmail },
    });

    if (result.count === 0) {
      return jsonError("Akun Gmail tidak ditemukan.", 404);
    }

    return NextResponse.json({ message: "Akun Gmail berhasil dihapus." });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return jsonError("Akun Gmail tidak ditemukan.", 404);
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return jsonError(
        "Akun ini masih digunakan oleh riwayat laporan dan tidak dapat dihapus.",
        409,
      );
    }

    console.error("Could not delete Gmail account:", error);
    return jsonError("Tidak dapat menghapus akun Gmail.", 500);
  }
}
