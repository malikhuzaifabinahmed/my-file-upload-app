// app/api/files/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

const csvFilePath = path.join(process.cwd(), "uploads", "file_records.csv");

export async function GET() {
  try {
    const records = [];

    if (fs.existsSync(csvFilePath)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(csvParser())
          .on("data", (data) => {
            // Transform the data to match the frontend property names
            records.push({
              id: data["File ID"],
              name: data["File Name"],
              path: data["File Path"],
              size: data["File Size (bytes)"],
              uploadDate: data["Upload Date"],
            });
          })
          .on("end", resolve)
          .on("error", reject);
      });
    }

    return NextResponse.json(records);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch file records", details: err.message },
      { status: 500 }
    );
  }
}
