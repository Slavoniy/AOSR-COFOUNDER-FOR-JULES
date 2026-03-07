const fs = require('fs');

const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // I will make sure the UI matches exactly what the user wanted:
  // "Отображение на несколько строк: Для меток вроде {{object}}, {{zakazchik}}, {{stroiteli}} ... визуально разбивать это на строки в самом веб-интерфейсе"

  // Create a helper function inside App and EstimateModuleView
  if (!code.includes("function splitTextLines")) {
    const helper = `
  // Helper to visually split text into multiple lines in the web UI
  const splitTextLines = (text, lines) => {
    if (!text) return Array(lines).fill("");
    const words = text.split(" ");
    const wordsPerLine = Math.ceil(words.length / lines);
    const result = [];
    for (let i = 0; i < lines; i++) {
      result.push(words.slice(i * wordsPerLine, (i + 1) * wordsPerLine).join(" "));
    }
    return result;
  };
`;
    // Add it after export function
    code = code.replace(/(export function App\(\) \{[\s\S]*?)(const \[)/, `$1${helper}\n  $2`);
    code = code.replace(/(export function EstimateModuleView\([^)]*\) \{[\s\S]*?)(const \[)/, `$1${helper}\n  $2`);
  }

  // I also need to add the download button to both files.
  // In `App.tsx` there's a `<div className="mt-8 flex justify-center print:hidden">`
  // with a `<button>` to print.
  const buttonRegex = /(<button\s+onClick=\{window\.print\}\s+className="[^"]+">\s*<Printer className="w-4 h-4" \/>\s*Распечатать АОСР\s*<\/button>)/g;

  const generateLogic = `
  const handleDownloadDocx = async () => {
    const docxUtils = await import('../../utils/docxUtils.ts').catch(() => import('./utils/docxUtils.ts'));

    // Derived values as requested:
    // zakazchik2: only name from zakazchik1
    const zakazchik2 = actDetails.zakazchik1.split(',').pop()?.trim() || actDetails.zakazchik1;
    // stroiteli21: only name from stroiteli11
    const stroiteli21 = actDetails.stroiteli11.split(',').pop()?.trim() || actDetails.stroiteli11;
    // stroiteli22: only name from stroiteli12
    const stroiteli22 = actDetails.stroiteli12.split(',').pop()?.trim() || actDetails.stroiteli12;
    // projectirovshik2: only name from projectirovshik1
    const projectirovshik2 = actDetails.projectirovshik1.split(',').pop()?.trim() || actDetails.projectirovshik1;
    // stroiteli32: only name from stroiteli3
    const stroiteli32 = actDetails.stroiteli3.split(',').pop()?.trim() || actDetails.stroiteli3;

    // stroiteli (short company name) "оставить только название компании"
    // Usually it's the first part before the comma
    const stroiteliShort = actDetails.stroiteli.split(',')[0]?.trim() || actDetails.stroiteli;

    const data = {
      ...actDetails,
      D1: actDetails.startDate,
      M1: actDetails.startMonth,
      Y1: actDetails.startYear,
      D2: actDetails.endDate,
      M2: actDetails.endMonth,
      Y2: actDetails.endYear,
      D: actDetails.date,
      M: actDetails.month,
      Y: actDetails.year,
      N: actDetails.copies,
      DOP: actDetails.apps,
      rabota: actDetails.workName || actDetails.project, // Fallback
      project: actDetails.projectDoc,
      material: actDetails.materials,
      SNIP: actDetails.standards,
      Next: actDetails.nextWorks,
      '№': \`\${actDetails.numberPrefix}\${currentActIndex !== undefined ? currentActIndex + 1 : 1}\`,

      // Derived fields
      zakazchik2,
      stroiteli21,
      stroiteli22,
      projectirovshik2,
      stroiteli32,

      // Overwrite stroiteli with short for the specific tag in docx if it was separate, but DOCX only has 'stroiteli'.
      // If docx uses {{stroiteli}} for both full and short, replacing it might affect both.
      // But the docx only has {{stroiteli}} tag.
      // We will leave it as actDetails.stroiteli. The user will need to adjust the docx if they want both full and short via different tags.
    };

    docxUtils.generateDocx('/aosr_template.docx', data, \`АОСР_\${data['№'].replace(/\\//g, '_')}.docx\`);
  };
`;

  if (!code.includes("handleDownloadDocx")) {
     code = code.replace(/const \[actDetails/, `${generateLogic}\n  const [actDetails`);
  }

  const newButton = `<button onClick={handleDownloadDocx} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-200 transition-all active:scale-95 ml-4">Скачать DOCX</button>\n$1`;

  code = code.replace(buttonRegex, newButton);

  fs.writeFileSync(file, code);
}
