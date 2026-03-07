const fs = require('fs');
const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Make sure ALL inputs that need multiline are textareas!
  // I might have missed some because of regex mismatches.
  // The ones that need multiline: object, zakazchik, stroiteli, projectirovshik, etc.

  // Replace object
  code = code.replace(/<input\s+className="flex-1[^>]+value=\{actDetails\.object\}[^>]+\/>/g,
  `<textarea rows={2} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.object} onChange={(e) => setActDetails({...actDetails, object: e.target.value})} />`);

  // zakazchik
  code = code.replace(/<input\s+className="flex-1[^>]+value=\{actDetails\.zakazchik\}[^>]+\/>/g,
  `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.zakazchik} onChange={(e) => setActDetails({...actDetails, zakazchik: e.target.value})} />`);

  // stroiteli
  code = code.replace(/<input\s+className="flex-1[^>]+value=\{actDetails\.stroiteli\}[^>]+\/>/g,
  `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.stroiteli} onChange={(e) => setActDetails({...actDetails, stroiteli: e.target.value})} />`);

  // projectirovshik
  code = code.replace(/<input\s+className="flex-1[^>]+value=\{actDetails\.projectirovshik\}[^>]+\/>/g,
  `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none leading-tight" value={actDetails.projectirovshik} onChange={(e) => setActDetails({...actDetails, projectirovshik: e.target.value})} />`);

  fs.writeFileSync(file, code);
}
