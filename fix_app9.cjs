const fs = require('fs');

const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Need to correctly resolve the util depending on the file location
  if (file.includes('EstimateModuleView')) {
    code = code.replace(/import\('\.\/utils\/docxUtils'\)/g, "import('../../utils/docxUtils')");
  } else {
    code = code.replace(/import\('\.\/utils\/docxUtils'\)/g, "import('./utils/docxUtils')");
  }

  fs.writeFileSync(file, code);
}
