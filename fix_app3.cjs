const fs = require('fs');

const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace usage of old keys in UI with new keys
  code = code.replace(/actDetails\.developer/g, "actDetails.zakazchik");
  code = code.replace(/actDetails\.contractor/g, "actDetails.stroiteli");
  code = code.replace(/actDetails\.designer/g, "actDetails.projectirovshik");
  code = code.replace(/actDetails\.repDeveloper/g, "actDetails.zakazchik1");
  code = code.replace(/actDetails\.repContractorSk/g, "actDetails.stroiteli12");
  code = code.replace(/actDetails\.repContractor/g, "actDetails.stroiteli11");
  code = code.replace(/actDetails\.repDesigner/g, "actDetails.projectirovshik1");
  code = code.replace(/actDetails\.repSubcontractor/g, "actDetails.stroiteli3");

  // also handle "docs" being split into "shema" and "ispitaniya"
  // If the user inputs "docs" anywhere, we probably want to update the UI textarea to two textareas or just one.
  // We'll replace `actDetails.docs` with `actDetails.shema` for now, then handle `ispitaniya`.
  code = code.replace(/actDetails\.docs/g, "actDetails.shema");

  fs.writeFileSync(file, code);
}
