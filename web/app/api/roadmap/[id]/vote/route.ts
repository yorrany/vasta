
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Mock vote success
  return NextResponse.json({ success: true });
}
