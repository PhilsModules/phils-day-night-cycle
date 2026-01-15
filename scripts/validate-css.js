const fs = require('fs');

const css = fs.readFileSync('styles/style.css', 'utf8');

// Check for unclosed comments
const openComments = (css.match(/\/\*/g) || []).length;
const closeComments = (css.match(/\*\//g) || []).length;

if (openComments !== closeComments) {
    console.log(`Error: Mismatch in comment markers. /*: ${openComments}, */: ${closeComments}`);
    // Find where the last unclosed comment starts
    let lastOpen = css.lastIndexOf('/*');
    let lastClose = css.lastIndexOf('*/');
    if (lastOpen > lastClose) {
        let vicinity = css.substring(lastOpen, Math.min(lastOpen + 100, css.length));
        console.log(`Potential unclosed comment starting at index ${lastOpen}: ${vicinity}...`);
    }
    process.exit(1);
}


let depth = 0;
// Remove comments for brace checking (simple regex, caveat: strings containing /*)
const cleanCss = css.replace(/\/\*[\s\S]*?\*\//g, ''); 

let lines = cleanCss.split('\n');

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    for (let char of line) {
        if (char === '{') depth++;
        if (char === '}') depth--;
    }
    
    if (depth < 0) {
        console.log(`Error: Unexpected '}' at line ${i + 1} (approx match due to comment stripping)`);
        console.log(line);
        process.exit(1);
    }
}

if (depth > 0) {
    console.log(`Error: Missing '}' at end of file. Depth is ${depth}`);
    process.exit(1);
}

console.log("Braces and Comments are balanced.");
