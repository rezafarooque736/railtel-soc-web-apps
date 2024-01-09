"use client";

import DocumentArrowDownIcon from "@/components/icons/document-arrow-down";
import DocumentArrowUpIcon from "@/components/icons/document-arrow-up";
import PaperClipIcon from "@/components/icons/paper-clip";
import { useFormState } from "react-dom";
import { SubmitButton } from "../SubmitButton";
import { createAttendanceAction } from "@/actions/attendance/createAttendanceAction";
import { downloadInExcelFromJSON } from "../downloadInExcelFromJSON";
import { useRef } from "react";

export default function AttendanceDatToDocs() {
  const formRef = useRef(null); // Create a ref for the form

  const initialState = {
    message: "",
    errors: {},
    type: "",
  };

  // useFormState is a hook that allows to update state based on the result of a form action
  const [state, formAction] = useFormState(
    createAttendanceAction,
    initialState
  );

  if (state?.data) {
    downloadInExcelFromJSON(state.data, state.filename);
    formRef.current.reset(); // Reset the form fields
  }

  return (
    <div className="flex flex-col p-6 border rounded-lg border-sky-500 w-96 bg-slate-50">
      <h2 className="pb-5 text-xl font-bold text-center">
        Upload DAT Attendance File
      </h2>
      <form ref={formRef} action={formAction}>
        <div className="flex flex-col space-y-6">
          <label
            htmlFor="datFileInput"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg border-slate-400 focus:outline-none focus:border-sky-600 hover:border-sky-600"
          >
            <PaperClipIcon />
            <span>Choose File</span>
            <span className="text-sm font-medium">(DAT Only)</span>
          </label>
          <input
            type="file"
            accept=".dat"
            id="datFileInput"
            name="datFileInput"
            className="hidden"
          />
          {state?.errors?.datFileInput && (
            <span className="text-sm text-red-600">
              {state?.errors?.datFileInput.join(", ")}
            </span>
          )}
          <SubmitButton
            pendingText="Downloading"
            notPendingText={
              <>
                <span>DAT to Docs: </span> <DocumentArrowUpIcon /> Upload
                <span>&</span>
                <DocumentArrowDownIcon /> <span>Download</span>
              </>
            }
          />
        </div>
      </form>
    </div>
  );
}
