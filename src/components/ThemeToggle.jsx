// components/ThemeToggle.jsx
import React from "react";

export default function ThemeToggle({ isDarkMode, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 transition duration-300 ease-in-out"
    >
      {isDarkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
