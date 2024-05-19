// FileUpload.jsx
import React, { useState } from "react";
import { FaUpload } from "react-icons/fa";

const FileUpload = ({ onFileUpload }) => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  async function encryptFile(buffer) {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      buffer
    );
    const exportedKey = await crypto.subtle.exportKey("raw", key);
    return { encryptedData, iv, exportedKey };
  }
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      onFileUpload("No file selected");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { encryptedData, iv, exportedKey } = await encryptFile(buffer);

    const formData = new FormData();
    const encryptedFile = new File([encryptedData], file.name);
    formData.append("file", encryptedFile);
    formData.append(
      "key",
      new Blob([exportedKey], { type: "application/octet-stream" })
    );
    formData.append("iv", new Blob([iv], { type: "application/octet-stream" }));

    try {
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
      onFileUpload(`File upload failed: ${error.message}`);

      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-xl rounded-lg transition duration-500">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 animate-fadeIn">
        File Upload
      </h1>
      <form onSubmit={handleUpload} className="space-y-6">
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
};

export default FileUpload;
