const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();
const TAGS = [
  'D1', 'D2', 'DOP', 'D', 'M1', 'M2', 'M', 'Next', 'N', 'SNIP', 'Y1', 'Y2', 'Y',
  'ispitaniya', 'material', 'object', 'projectirovshik1', 'projectirovshik2', 'projectirovshik',
  'project', 'rabota', 'shema', 'stroiteli11', 'stroiteli12', 'stroiteli21', 'stroiteli22',
  'stroiteli32', 'stroiteli3', 'stroiteli', 'zakazchik1', 'zakazchik2', 'zakazchik', '№'
];

let totalReplaced = 0;
const sortedTags = [...TAGS].sort((a, b) => b.length - a.length);

sortedTags.forEach(t => {
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
