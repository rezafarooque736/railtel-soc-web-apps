"use server";

import { z } from "zod";
import getJSONfromJSONfile from "./getJSONfromJSONfile";

// 1. create schema
const MAX_FILE_SIZE = 1024 * 1024 * 5; //5MB
function checkFileType(file) {
  if (file?.name) {
    const fileType = file.name.split(".").pop();
    if (fileType === "json") return true;
  }
  return false;
}

const ampFilesSchema = z.object({
  jsonFileInput: z
    .any()
    .refine((file) => file.size > 0, "File is required")
    .refine((file) => file.size < MAX_FILE_SIZE, "Max size is 5MB.")
    .refine((file) => checkFileType(file), "Only .json formats are supported."),
});
export const ampAction = async (prevSatate, formData) => {
  try {
    // 2. create fields
    const validatedFile = ampFilesSchema.safeParse({
      jsonFileInput: formData.get("jsonFileInput"),
    });

    if (!validatedFile.success) {
      console.log("Error Occured", validatedFile);
      return {
        type: "error",
        errors: validatedFile.error.flatten().fieldErrors,
        message: "Missed .json file, failed to upload",
      };
    }

    const { jsonFileInput } = validatedFile.data;
    const res = await getJSONfromJSONfile(jsonFileInput);

    return {
      type: "success",
      message: "json file uploaded successfully to DB",
      data: res,
      filename: jsonFileInput.name.split(".")[0],
    };
  } catch (error) {
    console.log("Database Error occurred", error);
    return {
      type: "error",
      message: "Database Error: Failed to create user",
    };
  }
};
