// app/api/upload/route.js
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { v4 as uuidv4 } from "uuid";

// Ensure the uploads directory exists
const uploadDir = path.join(process.cwd(), "/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define the CSV file path and headers
const csvFilePath = path.join(process.cwd(), "uploads", "file_records.csv");
const csvHeaders = [
  { id: "id", title: "File ID" },
  { id: "name", title: "File Name" },
  { id: "path", title: "File Path" },
  { id: "size", title: "File Size (bytes)" },
  { id: "uploadDate", title: "Upload Date" },
];

// Ensure the CSV file exists and has the correct headers
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(
    csvFilePath,
    csvHeaders.map((header) => header.title).join(",") + "\n"
  );
}

const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: csvHeaders,
  append: true,
});

export const config = {
  api: {
    bodyParser: false, // Disabling body parsing by Next.js
  },
};

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.startsWith("multipart/form-data")) {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const keyBlob = formData.get("key");
    const ivBlob = formData.get("iv");

    if (!file || !keyBlob || !ivBlob) {
      return NextResponse.json(
        { error: "Missing file, key, or iv" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const keyBuffer = Buffer.from(await keyBlob.arrayBuffer());
    const ivBuffer = Buffer.from(await ivBlob.arrayBuffer());

    const filePath = path.join(uploadDir, file.name);
    const fileId = uuidv4(); // Generate a unique file ID

    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(`${filePath}.iv`, ivBuffer);
    fs.writeFileSync(`${filePath}.key`, keyBuffer);

    // Write the file record to CSV
    await csvWriter.writeRecords([
      {
        id: fileId,
        name: file.name,
        path: filePath,
        size: buffer.length,
        uploadDate: new Date().toISOString(),
      },
    ]);

    return NextResponse.json({ message: "File uploaded successfully", fileId });
  } catch (err) {
    return NextResponse.json(
      { error: "File upload failed", details: err.message },
      { status: 500 }
    );
  }
}
