import { Client } from "pg";

let globalClient = null;

export async function getPostgresqlDBConnection() {
  if (globalClient) {
    return globalClient;
  }

  // If no connection exists, create a new one
  const client = new Client({
    user: process.env.PostgreSQL_USER,
    password: process.env.PostgreSQL_PASSWORD,
    database: process.env.PostgreSQL_DATABASE,
    host: process.env.PostgreSQL_HOST,
    port: 5432,
  });

  await client.connect();

  // Store the connection globally for reuse
  globalClient = client;

  return client;
}

export const createTableIfNotExistsPostgreSQL = async () => {
  try {
    const client = await getPostgresqlDBConnection();

    // Create the 'attendance' table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time_in TIME NOT NULL,
        status INT NOT NULL,
        time_out TIME NOT NULL,
        num_hr VARCHAR(20) NOT NULL,
        diff_of_hrs VARCHAR(50) NOT NULL,
        dailyhrs_status VARCHAR(50) NOT NULL
      );
    `;

    await client.query(createTableQuery);
    console.log('Table "attendance" created or already exists.');
  } catch (error) {
    console.log(error);
  }
};

export async function createAndInsertAttendanceTablePostgreSQL(dataToInsert) {
  try {
    const client = await getPostgresqlDBConnection();

    // Create the 'attendance' table if it doesn't exist
    await createTableIfNotExistsPostgreSQL();

    // Truncate the table before inserting new data
    const truncateTableQuery = "TRUNCATE TABLE attendance;";
    await client.query(truncateTableQuery);
    console.log('Table "attendance" truncated.');

    // Extract column names and values from the first object in the array
    const columns = Object.keys(dataToInsert[0]);

    // Construct the query with placeholders
    const insertDataQuery = `
      INSERT INTO attendance (${columns.join(", ")}) VALUES ${dataToInsert
      .map(
        (_, i) =>
          `(${columns
            .map((_, j) => `$${i * columns.length + j + 1}`)
            .join(", ")})`
      )
      .join(", ")};
    `;

    // Flatten the array of values for the parameterized query
    const values = dataToInsert.flatMap((obj) =>
      columns.map((col) => obj[col])
    );

    // Use the query method for bulk insert
    await client.query(insertDataQuery, values);

    console.log('Data inserted into the "attendance" table.');
  } catch (error) {
    console.error("Error inserting data:", error.message);
  }
}
