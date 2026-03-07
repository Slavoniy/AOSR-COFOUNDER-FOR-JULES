const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
// Clean up spell check and formatting tags inside handlebars
xml = xml.replace(/{{.*?}}/g, (match) => match.replace(/<[^>]+>/g, ''));
zip.file("word/document.xml", xml);
const newContent = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('aosr_template_fixed.docx', newContent);
console.log("Fixed DOCX template generated as aosr_template_fixed.docx");
