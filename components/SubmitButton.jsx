"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ pendingText, notPendingText }) {
  // useFormStatus is a React hook that provides information about the status of the last form submission.
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="w-full p-2 px-5 py-2 mb-2 mr-2 text-sm font-medium text-center text-white rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 hover:bg-gradient-to-bl focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:bg-opacity-70"
    >
      {pending ? (
        <div className="flex items-center justify-center gap-4">
          <span>{pendingText}</span>
          <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1">
          {notPendingText}
        </div>
      )}
    </button>
  );
}
