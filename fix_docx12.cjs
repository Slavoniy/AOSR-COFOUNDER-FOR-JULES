const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
// Test the regex on actual data:
xml = xml.replace(/(\{\{[^{}]*\}\})/g, match => match.replace(/<[^>]+>/g, ''));
console.log(xml.substring(7700, 7800));
