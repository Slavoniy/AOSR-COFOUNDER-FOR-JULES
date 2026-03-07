const fs = require('fs');
const PizZip = require('pizzip');
const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
let plainText = xml.replace(/<[^>]+>/g, '');
const dupes = plainText.match(/{{.*?{{.*?}}|}}.*?}}/g);
if (dupes) {
  console.log("Duplicate tag problems:", dupes);
}
