import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        filename: true,
        content: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(document, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve document." },
      { status: 500 },
    );
  }
}

export function POST(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export function PUT(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export function PATCH(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

export function DELETE(): NextResponse {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
