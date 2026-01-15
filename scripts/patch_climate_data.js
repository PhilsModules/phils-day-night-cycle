const fs = require('fs');

// Paths
const dataPath = 'scripts/climate-data-de.js';
const patchPath = 'scripts/temp_marine_output.json';

// Read files
const dataContent = fs.readFileSync(dataPath, 'utf8');
const patchContent = fs.readFileSync(patchPath, 'utf8');

// Define the indentation string (4 spaces)
const indent = '    ';

// Indent the patch content to match the file structure
// The first line will be handled by the replacement string prefix
// Subsequent lines need indentation
const indentedPatch = patchContent.split('\n').map((line, index) => {
    if (index === 0) return line; // First line doesn't need extra indent here
    return indent + line;
}).join('\n');

// Construct the replacement block
const replacement = `"marine_west_coast": ${indentedPatch},`;

// Find the lines to replace (878 to 1749 in 1-based index)
// In 0-based index: 877 to 1748
const lines = dataContent.split('\n');
const startLine0 = 877;
const endLine0 = 1748;

// Verify we are replacing the right thing
if (!lines[startLine0].includes('"marine_west_coast":')) {
    console.error(`Error: start line ${startLine0+1} does not contain "marine_west_coast":`);
    console.error(`Line content: ${lines[startLine0]}`);
    process.exit(1);
}

// Perform replacement
// Remove lines from startLine0 to endLine0 (inclusive) and insert replacement
lines.splice(startLine0, (endLine0 - startLine0 + 1), replacement);

// Write back
fs.writeFileSync(dataPath, lines.join('\n'), 'utf8');

console.log("Successfully patched climate-data-de.js");
