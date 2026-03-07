const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

const text = doc.getFullText();
const matches = text.match(/{{[^}]+}}/g);
if (matches) {
    const unique = [...new Set(matches)].sort();
    console.log("Found tags:");
    unique.forEach(m => console.log(m));
} else {
    console.log("No tags found");
}
