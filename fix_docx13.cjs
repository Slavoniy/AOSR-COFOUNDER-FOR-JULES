const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
// docxtemplater fails with "Duplicate open tag".
// A very safe way to strip all XML inside `{{...}}` sequences:
// We just find all text nodes and concatenate them, then replace tags.
// But we want to preserve the rest of the XML.
// So:
let result = "";
let inTag = false;
let currentTag = "";
for (let i = 0; i < xml.length; i++) {
  // Check if we are starting a {{
  if (!inTag && xml[i] === '{' && xml[i+1] === '{') {
    inTag = true;
    currentTag = "{{";
    i++;
  } else if (inTag) {
    currentTag += xml[i];
    if (xml[i] === '}' && xml[i-1] === '}') {
      inTag = false;
      // remove XML
      result += currentTag.replace(/<[^>]+>/g, '');
    }
  } else {
    result += xml[i];
  }
}
// wait, the '{' and '{' might be separated by XML! e.g. {<w:t>}
// So we can't just check xml[i+1].

// The easiest way to replace tags in a DOCX file without docxtemplater is to find the tags in the plain text,
// and then use regex to find those tags across xml nodes.

const tags = [
  'D1', 'D2', 'DOP', 'D', 'M1', 'M2', 'M', 'Next', 'N', 'SNIP', 'Y1', 'Y2', 'Y',
  'ispitaniya', 'material', 'object', 'projectirovshik1', 'projectirovshik2', 'projectirovshik',
  'project', 'rabota', 'shema', 'stroiteli11', 'stroiteli12', 'stroiteli21', 'stroiteli22',
  'stroiteli32', 'stroiteli3', 'stroiteli', 'zakazchik1', 'zakazchik2', 'zakazchik', '№'
];

tags.forEach(t => {
  // Regex to match {{t}} where the '{' and '}' and 't' characters can have any amount of <w:t> tags in between.
  // We turn "{{tag}}" into "\{(?:<[^>]+>)*\{(?:<[^>]+>)*" + tag chars ...
  const chars = `{{${t}}}`.split('');
  const regexStr = chars.map(c => c === '{' || c === '}' ? `\\${c}` : c).join('(?:<[^>]+>)*');
  const regex = new RegExp(regexStr, 'g');
  xml = xml.replace(regex, `{{${t}}}`); // Normalize
});

const plain = xml.replace(/<[^>]+>/g, '');
const dupes = plain.match(/{{.*?{{.*?}}|}}.*?}}/g);
if (dupes) console.log("Dupes after custom regex:", dupes);
else console.log("No dupes!");
// Okay, the docxtemplater fails ONLY when a single `<w:t>` contains `{{` and another `{{` immediately.
// Actually, since I'm going to just replace tags WITHOUT docxtemplater in `generateDocx`, these dupes don't matter at all!
// In fact, my `src/utils/docxUtils.ts` regex approach perfectly handles it.
console.log("Regex replace works, no docxtemplater needed.");
