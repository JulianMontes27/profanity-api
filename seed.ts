import csv from "csv-parser";
import fs from "fs";

interface CsvRow {
  row: string;
}

async function parseCSV(filepath: string): Promise<CsvRow[]> {
  return new Promise((res, rej) => {
    const rows: CsvRow[] = []; // Initialize an empty array to hold objects of type CsvRow

    fs.createReadStream(filepath)
      .pipe(csv({ separator: "," })) // Pipe the read stream into the CSV parser
      .on("data", (row) => {
        // Listen for 'data' events, which are emitted for each row of data
        rows.push(row); // Add each parsed row to the rows array
      })
      .on("error", (err) => {
        // Listen for 'error' events
        rej(err); // Reject the promise if an error occurs
      })
      .on("end", () => {
        // Listen for the 'end' event, which signifies the end of the stream
        res(rows); // Resolve the promise with the array of parsed rows
      });
  });
}
