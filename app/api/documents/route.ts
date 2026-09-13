import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  try {
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        title: true,
        filename: true,
      },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve documents." },
      { status: 500 },
    );
  }
}
