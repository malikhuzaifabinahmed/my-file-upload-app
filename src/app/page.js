// app/upload/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import FileItem from "../components/FileItem";
import FileUpload from "../components/FileUpload";

export default function UploadPage() {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    fetchFiles();
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const fetchFiles = async () => {
    const response = await fetch("/api/files");
    const data = await response.json();
    setFiles(data);
  };

  const decryptFile = async (encryptedBlob, iv, key) => {
    try {
      const encryptedData = await encryptedBlob.arrayBuffer();
      const decryptedData = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encryptedData
      );
      return new Blob([decryptedData]);
    } catch (error) {
      console.error("Decryption failed:", error);
      throw new Error("Decryption failed. Please check your key and IV.");
    }
  };

  const handleDownload = async (filename) => {
    try {
      const options = {
        types: [
          {
            description: "Files",
            accept: {
              "application/octet-stream": [`.${filename.split(".").pop()}`],
            },
          },
        ],
      };
      const fileHandle = await window.showSaveFilePicker(options);

      const xhr = new XMLHttpRequest();
      xhr.open("GET", `/api/files/${filename}`, true);
      xhr.responseType = "blob";

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setDownloadProgress(percentComplete);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const encryptedBlob = xhr.response;

          // Fetch iv and key
          const ivResponse = await fetch(`/api/files/${filename}/iv`);
          const ivArrayBuffer = await ivResponse.arrayBuffer();
          const iv = new Uint8Array(ivArrayBuffer);

          const keyResponse = await fetch(`/api/files/${filename}/key`);
          const keyArrayBuffer = await keyResponse.arrayBuffer();
          const key = await crypto.subtle.importKey(
            "raw",
            keyArrayBuffer,
            "AES-GCM",
            true,
            ["decrypt"]
          );
          const decryptedBlob = await decryptFile(encryptedBlob, iv, key);
          const writableStream = await fileHandle.createWritable();
          await writableStream.write(decryptedBlob);
          await writableStream.close();
          setMessage("File downloaded successfully");
          setDownloadProgress(0);
        } else {
          setMessage(`File download failed: ${xhr.statusText}`);
          setDownloadProgress(0);
        }
      };

      xhr.onerror = () => {
        setMessage("File download failed");
        setDownloadProgress(0);
      };

      xhr.send();
    } catch (error) {
      setMessage(`File download failed: ${error.message}`);
      setDownloadProgress(0);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const handleFileUpload = (msg) => {
    setMessage(msg);
    fetchFiles(); // Refresh the file list after upload
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900 flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8 transition duration-500">
      <div className="flex justify-end w-full max-w-2xl p-4">
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
      <FileUpload onFileUpload={handleFileUpload} />
      {message && (
        <p className="text-center text-sm text-gray-900 dark:text-gray-100 mt-4 animate-fadeIn">
          {message}
        </p>
      )}
      <div className="mt-8 max-w-2xl w-full space-y-4 p-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl rounded-lg transition duration-500">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4 animate-fadeIn">
          Uploaded Files
        </h2>
        <ul className="space-y-4">
          {files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              handleDownload={handleDownload}
            />
          ))}
        </ul>
        {downloadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mt-4">
            <div
              className="bg-green-600 text-xs font-medium text-green-100 text-center p-0.5 leading-none rounded-full"
              style={{ width: `${downloadProgress}%` }}
            >
              {downloadProgress.toFixed(0)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
