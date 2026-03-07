const fs = require('fs');
const PizZip = require('pizzip');

const content = fs.readFileSync('aosr_template.docx', 'binary');
const zip = new PizZip(content);
let xml = zip.file("word/document.xml").asText();

// Let's use docxtemplater's lexer without the expression-parser to understand where the XML tags are
// To completely fix it, we replace EVERYTHING like {{ <w:t>some</w:t> }} with {{some}}
// A manual but robust way: loop and replace `{{.*}}` ignoring XML.
// Wait! docxtemplater supports a delimiter like `{{` and `}}`
// The duplicate tag problem is that `aosr_template.docx` itself has something like:
// `{{zakazchik}}{{zakazchik}}` with NO space between them in some places?
// Let's look at the XML near 7752
console.log(xml.substring(7700, 7800));
