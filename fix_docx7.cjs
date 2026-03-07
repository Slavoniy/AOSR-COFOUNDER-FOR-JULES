const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();

// Best regex approach: find all fragments like {{ <some xml> tagname <some xml> }}
// Actually, Word often splits `{` and `{` and `tagname` and `}` and `}`.
// So:
xml = xml.replace(/\{[^{}]*\{[^{}]*\}[^{}]*\}/g, (match) => {
    return match.replace(/<[^>]+>/g, '');
});

zip.file("word/document.xml", xml);
const newContent = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('aosr_template_fixed.docx', newContent);

const newZip = new PizZip(newContent);
try {
    const doc = new Docxtemplater(newZip, { paragraphLoop: true, linebreaks: true });
    const text = doc.getFullText();
    const matches = text.match(/{{[^}]+}}/g);
    if (matches) {
        const unique = [...new Set(matches)].sort();
        console.log("Found tags:");
        unique.forEach(m => console.log(m));
    }
} catch (e) {
    console.error(e);
}
