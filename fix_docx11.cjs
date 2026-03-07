const fs = require('fs');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
xml = xml.replace(/\{[^{}]*\{[^{}]*\}[^{}]*\}/g, (match) => {
    return match.replace(/<[^>]+>/g, '');
});
// To solve "Duplicate open tag" or "Duplicate close tag" we must also make sure two tags like `{{A}}{{B}}` that collapsed to `{{A}}{{B}}` in a single run are cleanly separated.
// The docxtemplater parser might fail if `{{` happens without spacing? No, it's usually because some <w:...> tags are still inside the `{` and `{` or similar.
// Wait! `\{[^{}]*\{[^{}]*\}[^{}]*\}` matches `{` then `{` then `}` then `}`.
// But what if it's `{{tag}}`? Yes, it matches that.
// What if it's `{{tag}} <w:t> {{tag2}}`? It matches them separately.
// The duplicate error happens if docxtemplater sees `{{` then `{{` again before `}}`.
// This means there's `{{` then `{{`. Our regex might have created it?
// Let's just fix it completely.

let cleanXml = xml;
// We know all the tags from earlier. Let's find each tag literal string (like "zakazchik") in the xml and ensure it's wrapped in {{ and }}.
// It's much easier to just replace all {{.*}} manually and NOT use docxtemplater!
// We don't have arrays or loops, we just need string replacement inside XML.
// Since docx is just XML, we can do a global replace of all tags inside `word/document.xml`.
// BUT, tags can be split like `{` `</w:t>` `<w:t>` `{` `zakazchik` `}` `</w:t>` `<w:t>` `}`
// If we just remove all `<w:...>` tags between `{{` and `}}` we get clean `{{tag}}`.
// Wait, if we use a regex to find everything starting with '{' and ending with '}' that forms a tag, it's hard in XML.
// Instead of docxtemplater, I can just write a robust replace function for our specific tags!
console.log("We'll implement a custom XML replacer in React.");
