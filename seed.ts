import csv from "csv-parser";
import fs from "fs";
import { Index } from "@upstash/vector";

const index = new Index({
  url: "https://on-shad-49680-us1-vector.upstash.io",
  token: "********",
});

interface CsvRow {
  text: string;
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
const STEP = 30;
const seed = async () => {
  const res = await parseCSV("training_dataset.csv");

  for (let i = 0; i < res.length; i += STEP) {
    const chunk = res.slice(i, i + STEP);
    const formatted = chunk.map((row, batchIndex) => ({
      data: row.text,
      id: i + batchIndex,
      metadata: { text: row.text },
    }));
    await index.upsert(formatted);
  }
};

seed();
