const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
const xml = zip.file("word/document.xml").asText();
const matches = xml.match(/{{.*?}}/g);
if (matches) {
    console.log("Found matches without removing word tags:");
    matches.forEach(m => console.log(m));
} else {
    console.log("No clean matches.");
}
