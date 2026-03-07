const fs = require('fs');

const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Let's add standard inputs to the UI side panel for all the required fields
  // We need input fields for: zakazchik, stroiteli, projectirovshik
  // Right now they might be named developer, contractor, designer. I already replaced them!
  // But wait, what if the inputs themselves in the HTML use the old state properties?

  // Replace `developer` with `zakazchik` in inputs
  code = code.replace(/value=\{actDetails\.developer\}/g, "value={actDetails.zakazchik}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, developer: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, zakazchik: e.target.value})}");

  code = code.replace(/value=\{actDetails\.contractor\}/g, "value={actDetails.stroiteli}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, contractor: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, stroiteli: e.target.value})}");

  code = code.replace(/value=\{actDetails\.designer\}/g, "value={actDetails.projectirovshik}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, designer: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, projectirovshik: e.target.value})}");

  code = code.replace(/value=\{actDetails\.repDeveloper\}/g, "value={actDetails.zakazchik1}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, repDeveloper: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, zakazchik1: e.target.value})}");

  code = code.replace(/value=\{actDetails\.repContractor\}/g, "value={actDetails.stroiteli11}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, repContractor: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, stroiteli11: e.target.value})}");

  code = code.replace(/value=\{actDetails\.repContractorSk\}/g, "value={actDetails.stroiteli12}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, repContractorSk: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, stroiteli12: e.target.value})}");

  code = code.replace(/value=\{actDetails\.repDesigner\}/g, "value={actDetails.projectirovshik1}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, repDesigner: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, projectirovshik1: e.target.value})}");

  code = code.replace(/value=\{actDetails\.repSubcontractor\}/g, "value={actDetails.stroiteli3}");
  code = code.replace(/onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, repSubcontractor: e\.target\.value\}\)\}/g, "onChange={(e) => setActDetails({...actDetails, stroiteli3: e.target.value})}");

  fs.writeFileSync(file, code);
}
