const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
const derivedMatch = app.match(/const zakazchik2 = [^\n]+/);
console.log("Derived logic snippet:", derivedMatch ? derivedMatch[0] : "Not found");
