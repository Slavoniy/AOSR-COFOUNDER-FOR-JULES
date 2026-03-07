const fs = require('fs');
let view = fs.readFileSync('src/components/views/EstimateModuleView.tsx', 'utf8');
console.log("Textareas for object/zakazchik:", (view.match(/<textarea[^>]+value=\{actDetails\.(object|zakazchik|stroiteli|projectirovshik|zakazchik1|stroiteli3)\}/g) || []).length);
