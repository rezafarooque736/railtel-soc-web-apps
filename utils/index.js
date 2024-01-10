import { getDBConnection } from "@/lib/mysqldb";

export function subtractTimes(num_hr, time = "8 hours 30 minutes") {
  // Parse the input times
  const [hours1, minutes1] = num_hr.match(/\d+/g).map(parseFloat);
  const [hours2, minutes2] = time.match(/\d+/g).map(parseFloat);

  // Convert times to minutes
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;

  // Subtract times
  const differenceInMinutes = totalMinutes1 - totalMinutes2;

  // Determine the sign of the result
  const sign = differenceInMinutes >= 0 ? "+" : "-";

  // Format the result
  const resultHours = Math.floor(Math.abs(differenceInMinutes) / 60);
  const resultMinutes = Math.abs(differenceInMinutes) % 60;

  if (resultHours === 0) {
    return {
      diff_of_hrs: `${sign}${resultMinutes} minutes`,
      differenceInMinutes,
    };
  } else {
    return {
      diff_of_hrs: `${sign}${resultHours} hours ${resultMinutes} minutes`,
      differenceInMinutes,
    };
  }
}

export function compareTimes(time1, time2 = "09:30:00") {
  // Convert times to Date objects
  const date1 = new Date(`1970-01-01T${time1}:00.000Z`);
  const date2 = new Date(`1970-01-01T${time2}:00.000Z`);

  // Compare the values
  if (date1 <= date2) {
    return 1;
  } else {
    return 0;
  }
}

// Helper function to calculate the difference in hours and minutes
export function calculateNumOfHours(start, end) {
  const startTime = new Date(`1970-01-01T${start}.000Z`);
  const endTime = new Date(`1970-01-01T${end}.000Z`);

  // Calculate the time difference
  const diff = endTime - startTime;

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours} hours, ${minutes} minutes`;
}

export async function checkIfDataExists(employeeId, date) {
  const connection = await getDBConnection();
  const [rows] = await connection.execute(
    "SELECT * FROM attendance WHERE employee_id = ? AND date = ?",
    [employeeId, date]
  );
  return rows.length > 0;
}

export function formatDate(inputDate) {
  const [day, month, year] = inputDate.split("-");
  const newDate =
    year.length > 2 ? `${year}-${month}-${day}` : `${day}-${month}-${year}`;
  return newDate;
}
