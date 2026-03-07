const fs = require('fs');
const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/..\/..\/utils\/docxUtils\.ts/g, './utils/docxUtils');
  code = code.replace(/\.\/utils\/docxUtils\.ts/g, './utils/docxUtils');
  fs.writeFileSync(file, code);
}
