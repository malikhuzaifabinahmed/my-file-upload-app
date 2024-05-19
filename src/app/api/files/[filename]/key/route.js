// app/api/files/[filename]/key/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req, { params }) {
  const { filename } = params;
  const keyPath = path.join(process.cwd(), "uploads", `${filename}.key`);

  if (fs.existsSync(keyPath)) {
    const key = fs.readFileSync(keyPath);
    return new NextResponse(key, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}.key"`,
      },
    });
  } else {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }
}
