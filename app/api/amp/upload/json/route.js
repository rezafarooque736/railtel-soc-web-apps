import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) return NextResponse.json({ success: false });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const jsonFile = buffer.toString("utf8");

    // Now you can work with the parsed JSON data as needed
    const jsonData = JSON.parse(jsonFile);

    const filteredData = jsonData.data.map((item) => {
      return {
        connector_guid: item.connector_guid,
        hostname: item.hostname,
        mac: item.network_addresses[0]?.mac,
        ip: item.network_addresses[0]?.ip,
      };
    });

    // Create a worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

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
