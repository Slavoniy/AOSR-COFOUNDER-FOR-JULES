const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
// docxtemplater fails with "Duplicate open tag" when there are `{{` inside `{{`
// Let's strip all formatting inside {{ }}
xml = xml.replace(/\{[^{}]*\{[^{}]*\}[^{}]*\}/g, (match) => {
    return match.replace(/<[^>]+>/g, '');
});

// Write it to disk and test it manually with docxtemplater parser online or simple regex
fs.writeFileSync('test.xml', xml);
