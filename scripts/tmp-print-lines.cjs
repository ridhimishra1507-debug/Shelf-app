const fs = require('node:fs');
const [file, startArg, endArg] = process.argv.slice(2);
const start = Number(startArg ?? 1);
const end = Number(endArg ?? 200);
const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
for (let i = start; i <= Math.min(end, lines.length); i += 1) {
  console.log(`${i} | ${lines[i - 1]}`);
}
