"use server";

import { NextResponse } from "next/server";

export default async function getJSONfromJSONfile(file) {
  try {
    const bytes = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8"); // convert ArrayBuffer to a string.
    const jsonFile = decoder.decode(bytes);

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

    return filteredData;
  } catch (error) {
    console.error("Error reading and parsing dat file:", error);
    return NextResponse.json({ success: false, error: "Invalid dat file" });
  }
}
