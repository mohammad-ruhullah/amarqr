import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = "force-dynamic";

async function tryEnsureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS usage_counter (
        id INT PRIMARY KEY DEFAULT 1,
        count BIGINT DEFAULT 0
      )
    `;
    await sql`
      INSERT INTO usage_counter (id, count) VALUES (1, 0)
      ON CONFLICT (id) DO NOTHING
    `;
  } catch {
    // table already exists or no CREATE permission — not critical
  }
}

function toNumber(val: unknown): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "bigint") return Number(val);
  if (typeof val === "string") {
    const n = parseInt(val, 10);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

export async function GET() {
  try {
    const result = await sql`
      SELECT count FROM usage_counter WHERE id = 1
    `;
    const count = toNumber(result[0]?.count);
    return NextResponse.json({ count });
  } catch {
    await tryEnsureTable();
    try {
      const result = await sql`
        SELECT count FROM usage_counter WHERE id = 1
      `;
      const count = toNumber(result[0]?.count);
      return NextResponse.json({ count });
    } catch {
      return NextResponse.json({ count: 0 });
    }
  }
}

export async function POST() {
  try {
    await sql`
      INSERT INTO usage_counter (id, count) VALUES (1, 1)
      ON CONFLICT (id) DO UPDATE SET count = usage_counter.count + 1
    `;
    return NextResponse.json({ success: true });
  } catch {
    await tryEnsureTable();
    try {
      await sql`
        INSERT INTO usage_counter (id, count) VALUES (1, 1)
        ON CONFLICT (id) DO UPDATE SET count = usage_counter.count + 1
      `;
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ success: false }, { status: 500 });
    }
  }
}
