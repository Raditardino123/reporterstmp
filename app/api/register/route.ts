import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Permintaan tidak berisi JSON yang valid." },
      { status: 400 },
    );
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    return NextResponse.json(
      { error: "Permintaan tidak berisi data pendaftaran yang valid." },
      { status: 400 },
    );
  }

  const body = payload as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || name.length > 80) {
    return NextResponse.json(
      { error: "Nama wajib diisi dan maksimal 80 karakter." },
      { status: 400 },
    );
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Masukkan alamat email yang valid." },
      { status: 400 },
    );
  }

  if (
    password.length < 8 ||
    new TextEncoder().encode(password).byteLength > 72
  ) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter dan maksimal 72 byte." },
      { status: 400 },
    );
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    }

    const hashedPassword = await hash(password, 12);
    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat." },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 409 },
      );
    }

    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Pendaftaran gagal. Silakan coba lagi." },
      { status: 500 },
    );
  }
}
