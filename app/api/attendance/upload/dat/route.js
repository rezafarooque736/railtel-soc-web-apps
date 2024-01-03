import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { namesWithId } from "./data";

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

  const generateDates = (year, month, days) => {
    const dates = [];
    for (let i = 1; i <= days; i++) {
      const day = i < 10 ? `0${i}` : `${i}`;
      const date = `${year}-${month}-${day}`;
      dates.push({ date, IN: "", OUT: "" });
    }
    return dates;
  };

  const resultArray = filteredLines.reduce((acc, line) => {
    const [id, dateTime] = line.split("\t").map((field) => field.trim());

    const [date, time] = dateTime.split(" ");
    const [year, month] = date.split("-");

    if (!acc[id]) {
      acc[id] = {};
    }

    if (!acc[id][month]) {
      const daysInMonth = new Date(year, month, 0).getDate();
      acc[id][month] = generateDates(year, month, daysInMonth);
    }

    const day = parseInt(date.split("-")[2]);
    const entry = acc[id][month][day - 1];
    if (entry) {
      if (!entry.IN) {
        entry.IN = time;
      } else {
        entry.OUT = time;
      }
    }

    return acc;
  }, {});

  const result = Object.entries(resultArray).map(([id, months]) => {
    const entry = { id, name: namesWithId[id] || "Unknown" };

    months["12"].forEach(({ date, IN, OUT }) => {
      if (isWeekend(date)) {
        entry[`${date} IN`] = "Week off";
        entry[`${date} OUT`] = "Week off";
      } else {
        entry[`${date} IN`] = IN || "";
        entry[`${date} OUT`] = OUT || "";
      }
    });

    return entry;
  });

  function isWeekend(dateString) {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
  }

  // console.log(result);

  // --------------------------------------------------------

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
