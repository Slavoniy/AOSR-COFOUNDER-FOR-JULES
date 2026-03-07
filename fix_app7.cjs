const fs = require('fs');

const files = ['src/App.tsx', 'src/components/views/EstimateModuleView.tsx'];
for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // zakazchik textarea is already using rows={2}, but we want rows={3}
  code = code.replace(/<textarea\s+rows=\{2\}\s+className="w-full border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50 resize-none"\s+value=\{actDetails\.zakazchik\}/, `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" value={actDetails.zakazchik}`);

  // stroiteli textarea
  code = code.replace(/<textarea\s+rows=\{2\}\s+className="w-full border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50 resize-none"\s+value=\{actDetails\.stroiteli\}/, `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" value={actDetails.stroiteli}`);

  // projectirovshik textarea
  code = code.replace(/<textarea\s+rows=\{2\}\s+className="w-full border-b border-black px-2 bg-blue-50\/30 outline-none focus:bg-yellow-50 resize-none"\s+value=\{actDetails\.projectirovshik\}/, `<textarea rows={3} className="w-full border-b border-black px-2 bg-blue-50/30 outline-none focus:bg-yellow-50 resize-none" value={actDetails.projectirovshik}`);

  // signatures
  // Let's replace the mapping at the bottom to have all 5
  // Original is a map of 2 or 5 elements. Let's just fix the whole signatures block for both components.
  const signaturesCode = `
              {/* Bottom Signatures - All 5 from template */}
              <div className="pt-8 space-y-6">
                {[
                  { label: "Представитель застройщика, технического заказчика...", name: actDetails.zakazchik1.split(',').pop()?.trim() || "Иванов И.И." },
                  { label: "Представитель лица, осуществляющего строительство...", name: actDetails.stroiteli11.split(',').pop()?.trim() || "Петров П.П." },
                  { label: "Представитель лица, осуществляющего строительство, по вопросам СК...", name: actDetails.stroiteli12.split(',').pop()?.trim() || "Сидоров С.С." },
                  { label: "Представитель лица, осуществляющего подготовку проектной документации...", name: actDetails.projectirovshik1.split(',').pop()?.trim() || "Кузнецов А.С." },
                  { label: "Представитель лица, выполнившего работы, подлежащие освидетельствованию...", name: actDetails.stroiteli3.split(',').pop()?.trim() || "Васильев И.Н." }
                ].map((sig, i) => (
                  <div key={i} className="space-y-1">
                    <div className="font-bold leading-tight">{sig.label}</div>
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 border-b border-black text-center text-[8px] bg-blue-50/30">{sig.name}</div>
                      <div className="w-24 border-b border-black text-center text-[8px]">(подпись)</div>
                      <div className="w-32 border-b border-black text-center text-[8px]">{sig.name}</div>
                    </div>
                  </div>
                ))}
              </div>
`;

  // We find `{/* Bottom Signatures` and replace until `</div>` that closes the map.
  code = code.replace(/\{\/\* Bottom Signatures[\s\S]*?\}\)\}\s*<\/div>/, signaturesCode.trim());

  fs.writeFileSync(file, code);
}
