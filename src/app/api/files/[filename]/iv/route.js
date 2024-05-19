// app/api/files/[filename]/iv/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  const { filename } = params;
  const ivPath = path.join(process.cwd(), "uploads", `${filename}.iv`);

  if (fs.existsSync(ivPath)) {
    const iv = fs.readFileSync(ivPath);
    return new NextResponse(iv, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}.iv"`,
      },
    });
  } else {
    return NextResponse.json({ error: "IV not found" }, { status: 404 });
  }
}
