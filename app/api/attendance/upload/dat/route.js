import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { namesWithId } from "./data";
import { compareTimes, subtractTimes } from "@/utils";
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

  // Helper function to calculate the difference in hours and minutes
  function calculateTimeDifference(start, end) {
    const startTime = new Date(`1970-01-01 ${start}`);
    const endTime = new Date(`1970-01-01 ${end}`);
    const diff = endTime - startTime;

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `${hours} hours, ${minutes} minutes`;
  }

  // Process the data
  filteredLines.forEach((entry) => {
    const [employee_id, timestamp] = entry.split("\t");
    const [date, time] = timestamp.split(" ");
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
  });

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

  // Call the functions to create the table and insert data
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
