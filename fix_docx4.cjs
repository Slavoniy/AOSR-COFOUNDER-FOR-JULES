const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();

// A generic way to fix Word docx tags broken by formatting:
// We will replace all cases of "}{" or "}{{" or "}} {" etc if they are split
// Instead of trying to fix regex, docxtemplater has a tool called docxtemplater-expression-parser but here we don't have it.
// Let's just find and list the pure tag names by stripping all XML tags in the entire doc!
let plainText = xml.replace(/<[^>]+>/g, '');
const matches = plainText.match(/{{[^}]+}}/g);
if (matches) {
    const unique = [...new Set(matches)].sort();
    console.log("Found tags:");
    unique.forEach(m => console.log(m));
}
