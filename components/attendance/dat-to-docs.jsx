"use client";

import DocumentArrowDownIcon from "@/components/icons/document-arrow-down";
import DocumentArrowUpIcon from "@/components/icons/document-arrow-up";
import PaperClipIcon from "@/components/icons/paper-clip";
import { useRef, useState } from "react";

export default function AttendanceDatToDocs() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(false);
  const [pending, setPending] = useState(false);
  const datFileRef = useRef(null);

  const handleDatFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setPending(true);
      const formData = new FormData();
      formData.set("file", file);

      const res = await fetch("/api/attendance/upload/dat", {
        method: "POST",
        body: formData,
      });

      const fileBlob = await res.blob();
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${file.name.split(".")[0]}.xlsx`;
      link.click();

      setPending(false);
      link.remove(); //afterwards we remove the element
      window.URL.revokeObjectURL(url);

      setFile(null);
      setStatus(false);
      datFileRef.current.value = null;
    } catch (error) {
      console.log("Error during uploading of file", error);
    }
  };

  return (
    <div className="flex flex-col p-6 rounded-lg w-96 bg-slate-200">
      <h2 className="pb-5 text-xl font-bold text-center">
        Upload DAT Attendance File
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col space-y-6">
          <label
            htmlFor="datFileInput"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg appearance-none border-sky-500 focus:outline-none focus:border-sky-600 hover:border-sky-600"
          >
            <PaperClipIcon />
            <span>Choose File</span>
            <span className="text-sm font-medium">(DAT Only)</span>
          </label>
          <input
            ref={datFileRef}
            type="file"
            accept=".dat"
            id="datFileInput"
            onChange={handleDatFileChange}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!status}
              className="flex text-sm items-center justify-center w-full gap-2 px-3 py-2 text-[.93rem]] text-white rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-opacity-70 disabled:cursor-not-allowed"
            >
              {pending ? (
                <>
                  <span>Downloading...</span>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <span>DAT to Docs: </span> <DocumentArrowUpIcon /> Upload
                  <span>&</span>
                  <DocumentArrowDownIcon /> <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
