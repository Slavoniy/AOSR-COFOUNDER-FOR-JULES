const fs = require('fs');
const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace inputs that were not replaced properly
  // Find `<input ... value={actDetails.zakazchik1}`
  code = code.replace(/<input[^>]+value=\{actDetails\.zakazchik1\}[^>]*\/>/g,
  `<textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.zakazchik1} onChange={(e) => setActDetails({...actDetails, zakazchik1: e.target.value})} />`);

  code = code.replace(/<input[^>]+value=\{actDetails\.stroiteli3\}[^>]*\/>/g,
  `<textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.stroiteli3} onChange={(e) => setActDetails({...actDetails, stroiteli3: e.target.value})} />`);

  // also projectirovshik1, stroiteli11, stroiteli12 can be long too, but maybe single line is fine as they weren't explicitly called out for "2-3 strings" in the prompt for those specific ones. However, `stroiteli3` was called out ("вставлено 2 раза расположить на 2 строки").
  // So replacing `stroiteli3` is correct.

  fs.writeFileSync(file, code);
}
