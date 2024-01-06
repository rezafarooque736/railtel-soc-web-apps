import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { namesWithId } from "./data";
import {
  calculateTimeDifference,
  checkIfDataExists,
  compareTimes,
  subtractTimes,
} from "@/utils";
import { createAndInsertAttendanceTable } from "@/lib/mysqldb";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) return NextResponse.json({ success: false });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const datFileString = buffer.toString("utf-8");

  // Split the data by newline character to get an array of lines
  const datFileArray = datFileString.split("\r\n");

  // Remove any empty lines
  const filteredLines = datFileArray.filter((line) => line.trim() !== "");

  const result = [];

  // Process the data
  for (const entry of filteredLines) {
    const [employee_id, timestamp] = entry.split("\t");
    const [date, time] = timestamp.split(" ");

    const doesDataExist = await checkIfDataExists(employee_id, date);

    if (!doesDataExist) {
      const existingEntry = result.find(
        (e) => e.employee_id === parseInt(employee_id) && e.date === date
      );

      if (existingEntry) {
        existingEntry.time_out = time;
      } else {
        result.push({
          employee_id: parseInt(employee_id),
          name: namesWithId[parseInt(employee_id)] || "Unknown",
          date: date,
          time_in: time,
          status: compareTimes(time),
          time_out: time,
        });
      }
    }
  }

  // Calculate additional fields
  result.forEach((entry) => {
    entry.num_hr = calculateTimeDifference(entry.time_in, entry.time_out);
    const { diff_of_hrs, differenceInMinutes } = subtractTimes(entry.num_hr);
    entry.diff_of_hrs = diff_of_hrs;
    entry.dailyhrs_status =
      differenceInMinutes < 0
        ? "late"
        : differenceInMinutes > 0
        ? "overtime"
        : "ontime";
  });

  createAndInsertAttendanceTable(result);

  try {
    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(result);

    // Create a workbook with a single worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");

    // Write the Excel data to a buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    const headers = new Headers();
    headers.append(
      "Content-Disposition",
      `attachment; filename=${file.name.split(".")[0]}.xlsx`
    );
    headers.append(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return new Response(excelBuffer, {
      headers,
    });
  } catch (error) {
    console.error("Error reading and parsing JSON file:", error);
    return NextResponse.json({ success: false, error: "Invalid JSON file" });
  }
}
