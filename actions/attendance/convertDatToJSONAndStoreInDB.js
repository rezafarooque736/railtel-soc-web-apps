"use server";

import { namesWithId } from "@/data/data";
import { createAndInsertAttendanceTable } from "@/lib/mysqldb";
import {
  calculateNumOfHours,
  checkIfDataExists,
  compareTimes,
  formatDate,
  subtractTimes,
} from "@/utils";
import { NextResponse } from "next/server";

export default async function convertDatToJSONAndStoreInDB(file) {
  try {
    const bytes = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8"); // convert ArrayBuffer to a string.
    const datFileString = decoder.decode(bytes);

    const filteredLines = processDatFile(datFileString);

    const result = [];

    // Process the data
    for (const entry of filteredLines) {
      const [employee_id, timestamp] = entry.split("\t");
      const [date, time] = timestamp.split(" ");

      const formattedDate = formatDate(date);
      const doesDataExist = await checkIfDataExists(employee_id, formattedDate);

      if (!doesDataExist) {
        const existingEntry = result.find(
          (e) =>
            e.employee_id === parseInt(employee_id) && e.date === formattedDate
        );

        if (existingEntry) {
          existingEntry.time_out = time;
        } else {
          result.push({
            employee_id: parseInt(employee_id),
            name: namesWithId[parseInt(employee_id)] || "Unknown",
            date: formattedDate,
            time_in: time,
            status: compareTimes(time),
            time_out: time,
          });
        }
      }
    }

    // Calculate additional fields
    result.forEach((entry) => {
      entry.num_hr = calculateNumOfHours(entry.time_in, entry.time_out);
      const { diff_of_hrs, differenceInMinutes } = subtractTimes(entry.num_hr);
      entry.diff_of_hrs = diff_of_hrs;
      entry.dailyhrs_status =
        differenceInMinutes < 0
          ? "late"
          : differenceInMinutes > 0
          ? "overtime"
          : "ontime";
    });

    if (result.length > 0) {
      await createAndInsertAttendanceTable(result);
      return { message: "dat file uploaded successfully to DB" };
    }

    return { message: "There is no new data to upload" };
  } catch (error) {
    console.error("Error reading and parsing dat file:", error);
    return NextResponse.json({ success: false, error: "Invalid dat file" });
  }
}

function processDatFile(datFileString) {
  // Split the data by newline character to get an array of lines
  const datFileArray = datFileString.split("\r\n");
  // Remove any empty lines
  const filteredLines = datFileArray.filter((line) => line.trim() !== "");

  return filteredLines;
}
