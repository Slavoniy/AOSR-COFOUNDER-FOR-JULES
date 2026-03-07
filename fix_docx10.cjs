const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
xml = xml.replace(/\{[^{}]*\{[^{}]*\}[^{}]*\}/g, (match) => {
    return match.replace(/<[^>]+>/g, '');
});
zip.file("word/document.xml", xml);

try {
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    console.log("Success with regex!");
} catch (e) {
    console.error("Errors:", JSON.stringify(e.properties, null, 2));
}
