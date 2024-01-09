"use server";

import { namesWithId } from "@/data/data";
import { createAndInsertAttendanceTable } from "@/lib/mysqldb";
import {
  calculateTimeDifference,
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
          const num_hr = calculateTimeDifference(time, time);
          const { diff_of_hrs, differenceInMinutes } = subtractTimes(num_hr);
          const dailyhrs_status =
            differenceInMinutes < 0
              ? "late"
              : differenceInMinutes > 0
              ? "overtime"
              : "ontime";

          result.push({
            employee_id: parseInt(employee_id),
            name: namesWithId[parseInt(employee_id)] || "Unknown",
            date: formatDate(date),
            time_in: time,
            status: compareTimes(time),
            time_out: time,
            num_hr,
            diff_of_hrs,
            dailyhrs_status,
          });
        }
      }
    }
    if (result.length > 0) {
      createAndInsertAttendanceTable(result);
    }

    return result;
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
