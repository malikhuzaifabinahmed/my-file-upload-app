// app/api/files/[filename]/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  const { filename } = params;
  const filePath = path.join(process.cwd(), "uploads", filename);
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    const res = new NextResponse(fileStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
    return res;
  } else {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
