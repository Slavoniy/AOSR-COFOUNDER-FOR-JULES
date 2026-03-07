// Let's test the above logic
const fs = require('fs');
const PizZip = require('pizzip');

const TAGS = [
  'D1', 'D2', 'DOP', 'D', 'M1', 'M2', 'M', 'Next', 'N', 'SNIP', 'Y1', 'Y2', 'Y',
  'ispitaniya', 'material', 'object', 'projectirovshik1', 'projectirovshik2', 'projectirovshik',
  'project', 'rabota', 'shema', 'stroiteli11', 'stroiteli12', 'stroiteli21', 'stroiteli22',
  'stroiteli32', 'stroiteli3', 'stroiteli', 'zakazchik1', 'zakazchik2', 'zakazchik', '№'
];

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
// To not break XML, we should replace ONLY the text nodes that form the tag.
// E.g. `{` `</w:t>` `<w:t>` `{` `zakazchik` `}` `</w:t>` `<w:t>` `}`
// If we replace this entire string with `zakazchikValue`, we REMOVED `</w:t><w:t>` which is FINE since they were just splitting the text!
// The tag was originally inside a `<w:t>` node, so the whole sequence `...` starts after some `<w:t>` and ends before `</w:t>`.
// So replacing the whole matched string with plain text is perfectly valid XML, it just merges text!
let totalReplaced = 0;
TAGS.forEach(t => {
  const chars = `{{${t}}}`.split('');
  const regexStr = chars.map(c => c === '{' || c === '}' ? `\\${c}` : c).join('(?:<[^>]+>)*');
  const regex = new RegExp(regexStr, 'g');
  xml = xml.replace(regex, (match) => {
    totalReplaced++;
    return `VALUE_FOR_${t}`;
  });
});
console.log("Total tags replaced:", totalReplaced);
zip.file("word/document.xml", xml);
const newContent = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('test_replaced.docx', newContent);
