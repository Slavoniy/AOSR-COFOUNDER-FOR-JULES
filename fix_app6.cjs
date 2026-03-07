const fs = require('fs');

const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Change "docs" in onChange to "shema"
  code = code.replace(/setActDetails\(\{\.\.\.actDetails, docs: e\.target\.value\}\)/g, "setActDetails({...actDetails, shema: e.target.value})");

  // Make sure to add `ispitaniya` to UI right next to `shema`
  const shemaRegex = /value=\{actDetails\.shema\}[\s\S]*?onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, shema: e\.target\.value\}\)\}\s*\/>/;

  const additionalFields = `
                            <div className="font-bold mt-2">Результаты испытаний:</div>
                            <textarea
                              rows={1}
                              className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none"
                              value={actDetails.ispitaniya}
                              onChange={(e) => setActDetails({...actDetails, ispitaniya: e.target.value})}
                            />
`;
  if (!code.includes("actDetails.ispitaniya}")) {
    code = code.replace(shemaRegex, (m) => m + additionalFields);
  }

  // Update the HTML display in the document:
  // For `object`, `zakazchik`, `stroiteli`, `projectirovshik`, etc. we need to display it across 2-3 lines visually
  // I will create a function `MultiLineField` and use it

  if (!code.includes("MultiLineField")) {
    const multiLineField = `
  const MultiLineField = ({ value, lines, className = "" }: { value: string, lines: number, className?: string }) => {
    const parts = splitTextLines(value || "", lines);
    return (
      <div className="w-full">
        {parts.map((p, i) => (
          <div key={i} className={\`border-b border-black w-full min-h-[1.2em] \${className}\`}>{p}</div>
        ))}
      </div>
    );
  };
`;
    code = code.replace(/(const splitTextLines = [^;]+;)/, `$1\n${multiLineField}`);
  }

  // Let's replace the single input fields in the document with MultiLineField where appropriate
  // Wait, if we replace `<input className="flex-1 border-b border-black...` with MultiLineField,
  // the user won't be able to edit it inside the act document.
  // Wait, the `<input>` elements in `EstimateModuleView` inside `<div id="aosr-document">` are used by the user to edit!
  // If we change them to `MultiLineField` (which is just `div`s), they lose editing capability there.
  // Instead, let's make `MultiLineField` an editable textarea that looks like lines?
  // Or just a `<textarea rows={2}` is the standard way React handles multiline!
  // I notice the app ALREADY uses `<textarea rows={2}...>` for `actDetails.materials` etc!

  // Yes! The user simply wants:
  // "Отображение на несколько строк ... визуально разбивать это на строки в самом веб-интерфейсе"
  // So I'll convert single `<input>` to `<textarea rows={2}>` or `3` for those fields.

  code = code.replace(/<input\s+className="flex-1 border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50"\s+value=\{actDetails\.object\}\s+onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, object: e\.target\.value\}\)\}\s*\/>/,
  `<textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.object} onChange={(e) => setActDetails({...actDetails, object: e.target.value})} />`);

  code = code.replace(/<input\s+className="flex-1 border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50"\s+value=\{actDetails\.zakazchik\}\s+onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, zakazchik: e\.target\.value\}\)\}\s*\/>/,
  `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.zakazchik} onChange={(e) => setActDetails({...actDetails, zakazchik: e.target.value})} />`);

  code = code.replace(/<input\s+className="flex-1 border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50"\s+value=\{actDetails\.stroiteli\}\s+onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, stroiteli: e\.target\.value\}\)\}\s*\/>/,
  `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.stroiteli} onChange={(e) => setActDetails({...actDetails, stroiteli: e.target.value})} />`);

  code = code.replace(/<input\s+className="flex-1 border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50"\s+value=\{actDetails\.projectirovshik\}\s+onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, projectirovshik: e\.target\.value\}\)\}\s*\/>/,
  `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.projectirovshik} onChange={(e) => setActDetails({...actDetails, projectirovshik: e.target.value})} />`);

  // Same for other fields in signatures: zakazchik1, stroiteli11, etc.
  code = code.replace(/<input\s+className="w-full border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50"\s+value=\{actDetails\.zakazchik1\}\s+onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, zakazchik1: e\.target\.value\}\)\}\s*\/>/,
  `<textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.zakazchik1} onChange={(e) => setActDetails({...actDetails, zakazchik1: e.target.value})} />`);

  code = code.replace(/<input\s+className="w-full border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50"\s+value=\{actDetails\.stroiteli3\}\s+onChange=\{\(e\) => setActDetails\(\{\.\.\.actDetails, stroiteli3: e\.target\.value\}\)\}\s*\/>/,
  `<textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.stroiteli3} onChange={(e) => setActDetails({...actDetails, stroiteli3: e.target.value})} />`);

  fs.writeFileSync(file, code);
}
