import mysql from "mysql2/promise";

// create the connection
export const connection = await mysql.createConnection({
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  host: process.env.HOST,
  port: 3306,
});

export async function createAndInsertAttendanceTable(dataToInsert) {
  try {
    // create the 'attendance' table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`attendance\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`employee_id\` INT NOT NULL,
        \`name\` VARCHAR(50) NOT NULL,
        \`date\` DATE NOT NULL,
        \`time_in\` TIME NOT NULL,
        \`status\` INT NOT NULL,
        \`time_out\` TIME NOT NULL,
        \`num_hr\` VARCHAR(20) NOT NULL,
        \`diff_of_hrs\` VARCHAR(50) NOT NULL,
        \`dailyhrs_status\` VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
    `;

    await connection.execute(createTableQuery);
    console.log('Table "attendance" created or already exists.');

    // Extract column names and values from the first object in the array
    const columns = Object.keys(dataToInsert[0]);

    // Construct the query with placeholders
    const insertDataQuery = `
      INSERT INTO \`attendance\` (${columns
        .map((col) => `\`${col}\``)
        .join(", ")}) VALUES ?;
    `;

    // Extract values from the array of objects
    const values = dataToInsert.map((obj) => columns.map((col) => obj[col]));

    // Use the query method for bulk insert
    await connection.query(insertDataQuery, [values]);

    console.log('Data inserted into the "attendance" table.');
  } catch (error) {
    console.error("Error inserting data:", error.message);
  } finally {
    // Close the connection when done
    connection.end();
  }
}
