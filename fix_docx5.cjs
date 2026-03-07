const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
// Clean it up completely so docxtemplater can parse without errors
xml = xml.replace(/(<w:t[^>]*>)(.*?)(<\/w:t>)/g, (match, p1, p2, p3) => {
    return p1 + p2 + p3;
});
// The actual issue is that tags are split across multiple <w:t> elements
// We can use a regex to find all text inside <w:t> tags, build the full string, and map back, but that's complex.
// Instead we'll use docxtemplater's built-in feature to load the document as-is, BUT docxtemplater throws if tags have duplicate open/close.
// Wait, the duplicate open/close tags error happens because `aosr_template.docx` literally has duplicate curly braces like `{{ {{object}} }}` or similar?
// Let's check:
let plainText = xml.replace(/<[^>]+>/g, '');
const snippet = plainText.match(/.{0,20}{{.{0,20}/g);
console.log(snippet.slice(0, 10));
