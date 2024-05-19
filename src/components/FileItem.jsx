// components/FileItem.jsx
import React from "react";
import { FaFileAlt, FaDownload } from "react-icons/fa";
import { formatFileSize } from "../utils/formatFileSize";

export default function FileItem({ file, handleDownload }) {
  return (
    <li
      key={file.id}
      className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center space-x-4"
    >
      <div className="flex-shrink-0">
        <FaFileAlt className="text-gray-900 dark:text-gray-100 w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
          {file.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Size: {formatFileSize(file.size)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Uploaded on: {new Date(file.uploadDate).toLocaleString()}
        </p>
      </div>
      <div>
        <button
          onClick={() => handleDownload(file.name)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out transform hover:scale-105"
        >
          <FaDownload className="mr-2" />
          Download
        </button>
      </div>
    </li>
  );
}
