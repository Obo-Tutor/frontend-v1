"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function App() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [uploadResponse, setUploadResponse] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      router.push("/");
    }
  }, []);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    router.push("/admin");
  };

  const handleFileUpload = async () => {
    setUploadResponse("");
    setIsLoaded(true);
    const formData = new FormData();

  // Add new state for validation
  const [isValidating, setIsValidating] = useState(false);
  const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250MB in bytes
  const UPLOAD_TIMEOUT = 300000; // 5 minutes timeout

  const validateFiles = (files) => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_FILE_SIZE) {
        toast.error(`File ${files[i].name} exceeds 250MB limit`);
        return false;
      }
      if (!files[i].type.includes('pdf')) {
        toast.error(`File ${files[i].name} is not a PDF`);
        return false;
      }
    }
    return true;
  };

  const handleFileChange = (e) => {
    setIsValidating(true);
    const selectedFiles = e.target.files;
    if (validateFiles(selectedFiles)) {
      setFiles(selectedFiles);
    } else {
      e.target.value = null; // Reset file input
      setFiles([]);
    }
    setIsValidating(false);
  };

  const handleFileUpload = async () => {
    if (!files.length) {
      toast.error("Please select files to upload");
      return;
    }

    setUploadResponse("");
    setIsLoaded(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

      const response = await axios.post(
        process.env.NEXT_PUBLIC_DOMAIN_NAME_MODEL + "/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // You can add a progress state and UI if needed
          },
        }
      );

      clearTimeout(timeoutId);
      setUploadResponse(response.data.message);
      setUploadedFiles(response.data.files);
      toast.success("Files uploaded successfully");

    } catch (error) {
      console.error("Error uploading files:", error);
      
      if (error.name === 'AbortError') {
        toast.error("Upload timeout - Please try again");
      } else if (error.response) {
        switch (error.response.status) {
          case 413:
            toast.error("Files too large for server");
            break;
          case 415:
            toast.error("Unsupported file type");
            break;
          case 500:
            toast.error("Server error processing files");
            break;
          default:
            toast.error(`Upload failed: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        toast.error("No response from server - Check your connection");
      } else {
        toast.error("Failed to upload files");
      }

      setUploadResponse("Failed to upload files");
    } finally {
      setIsLoaded(false);
    }
  };

  return (
    <div className="flex bg-slate-600 h-screen flex-col items-center justify-center">
      <div className="flex justify-between items-center ">
        <h1 className="p-5 font-extrabold text-3xl text-amber-50">
          Obo Tutor-Admin Panel
        </h1>
        <Link href="/admin/profiles">
          <button className="p-5 m-5 rounded-lg text-white bg-slate-800 hover:bg-slate-700">
            Update Student Profiles
          </button>
        </Link>

        <button
          className="p-5 m-5 rounded-lg text-white bg-slate-800 hover:bg-slate-700"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <h2 className="text-red-500">Maximum 250 MB Size</h2>

      <div className="flex border border-blue-50 p-10 text-xl text-white">
        <input
          className="bg-slate-800 p-5 rounded-md"
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
        />

        <button
          className="p-5 bg-slate-800 rounded-lg ml-5 hover:bg-slate-700"
          onClick={handleFileUpload}
        >
          Upload Files
        </button>
      </div>

      {isLoaded && (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {uploadResponse && (
        <div className="bg-slate-900/50 text-white m-5 p-5">
          <div>
            <h2>Upload Response:</h2>
            <h3>{uploadResponse}</h3>
          </div>
          {uploadedFiles.length > 0 && (
            <div className="mt-5">
              <h4>Uploaded Files:</h4>
              <ul>
                {uploadedFiles.map((file, index) => (
                  <li key={index} className="text-green-400">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
