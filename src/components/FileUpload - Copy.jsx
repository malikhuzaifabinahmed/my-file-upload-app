// components/FileUpload.jsx
import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

export default function FileUpload({ onFileUpload }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const encryptFile = async (file) => {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const data = await file.arrayBuffer();
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    return { encryptedData, iv, key };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      const { encryptedData, iv, key } = await encryptFile(file);

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([encryptedData], { type: file.type }),
        file.name
      );
      formData.append("iv", new Blob([iv]));
      formData.append(
        "key",
        new Blob([await crypto.subtle.exportKey("raw", key)])
      );

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onFileUpload(`File uploaded successfully. File ID: ${data.fileId}`);
          setUploadProgress(0);
        } else {
          onFileUpload(`File upload failed: ${xhr.statusText}`);
          setUploadProgress(0);
        }
      };

      xhr.onerror = () => {
        onFileUpload("File upload failed");
        setUploadProgress(0);
      };

      xhr.send(formData);
    } catch (error) {
      onFileUpload(`File encryption failed: ${error.message}`);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl rounded-lg transition duration-500">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 animate-fadeIn">
        File Upload
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <label htmlFor="file-upload" className="sr-only">
            Upload file
          </label>
          <div className="relative w-full">
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              onChange={handleFileChange}
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            />
          </div>
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress.toFixed(0)}%
              </div>
            </div>
          )}
          <button
            type="submit"
            className="flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <FaUpload className="mr-2" />
            Upload
          </button>
        </div>
      </form>
    </div>
  );
}
