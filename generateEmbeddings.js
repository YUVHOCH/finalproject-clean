require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const OpenAI = require('openai');

// Make sure we have the API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY.trim()
});

const INPUT_FILE = 'input_embeddings.csv';
const OUTPUT_FILE = 'output_embeddings.csv';

// Function to get embedding from OpenAI
async function getEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error getting embedding:', error);
    return null;
  }
}

// Process the CSV file
async function processCSV() {
  const records = [];
  
  // Read input CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(INPUT_FILE)
      .pipe(csv())
      .on('data', async (row) => {
        records.push(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Read ${records.length} records from CSV`);

  // Process each record
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    console.log(`Processing record ${i + 1}/${records.length} (SKU: ${record.sku})`);

    // Get embeddings for both short and long descriptions
    const shortEmb = await getEmbedding(record.shortEmb || '');
    const longEmb = await getEmbedding(record.longEmb || '');

    // Update record with embeddings
    records[i] = {
      sku: record.sku,
      shortEmb: JSON.stringify(shortEmb),
      longEmb: JSON.stringify(longEmb)
    };
  }

  // Write output CSV
  const csvWriter = createObjectCsvWriter({
    path: OUTPUT_FILE,
    header: [
      { id: 'sku', title: 'sku' },
      { id: 'shortEmb', title: 'shortEmb' },
      { id: 'longEmb', title: 'longEmb' }
    ]
  });

  await csvWriter.writeRecords(records);
  console.log(`Wrote ${records.length} records to ${OUTPUT_FILE}`);
}

// Run the script
processCSV().catch(console.error); 