"use server";

import { z } from "zod";
import convertDatToJSONAndStoreInDB from "./convertDatToJSONAndStoreInDB";

// 1. create schema
const MAX_FILE_SIZE = 1024 * 1024 * 1; //1MB
function checkFileType(file) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType === "dat") return true;
  }
  return false;
}

const attendanceFilesSchema = z.object({
  datFileInput: z
    .any()
    .refine((file) => file.size > 0, "File is required")
    .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 1MB.")
    .refine((file) => checkFileType(file), "Only .dat formats are supported."),
});

export const createAttendanceAction = async (prevSatate, formData) => {
  try {
    // 2. create fields
    const validatedFile = attendanceFilesSchema.safeParse({
      datFileInput: formData.get("datFileInput"),
    });

    if (!validatedFile.success) {
      console.log("Error Occured", validatedFile);
      return {
        type: "error",
        errors: validatedFile.error.flatten().fieldErrors,
        message: "Missed .dat file, failed to upload",
      };
    }

    const { datFileInput } = validatedFile.data;

    // 3. convert dat to json and store in DB
    const res = await convertDatToJSONAndStoreInDB(datFileInput);

    return {
      type: "success",
      res,
    };
  } catch (error) {
    console.log("Database Error occurred", error);
    return {
      type: "error",
      message: "Database Error: Failed to create user",
    };
  }
};
