const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();

// Remove completely <w:proofErr ... />
xml = xml.replace(/<w:proofErr[^>]*>/g, '');
// For any sequence of {{ ... }}, we want to remove all XML tags inside
// A simpler way: we just find {{ and }} and ensure nothing in between has < or >
// Since word splits text, we can do a global replace of something like
// {{<w:t>stuff</w:t>}} => {{stuff}}
// A known trick for docxtemplater:
// Let's rely on docxtemplater's parser if we use a module, but here we can just do a regex
// replace any xml tags between {{ and }}
xml = xml.replace(/({{[^{}]*}})/g, match => match.replace(/<[^>]+>/g, ''));

zip.file("word/document.xml", xml);
const newContent = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('aosr_template_fixed.docx', newContent);

const Docxtemplater = require('docxtemplater');
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
