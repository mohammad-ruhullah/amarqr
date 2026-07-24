import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const reviews = await sql`
      SELECT id, name, message, rating, created_at
      FROM reviews
      WHERE approved = true
      ORDER BY created_at DESC
      LIMIT 20
    `;
    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const { name, message, rating } = await request.json();
    if (!name || !message || typeof rating !== "number") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    await sql`
      INSERT INTO reviews (name, message, rating)
      VALUES (${name.slice(0, 100)}, ${message.slice(0, 500)}, ${rating})
    `;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
