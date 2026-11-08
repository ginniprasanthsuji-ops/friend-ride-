import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync('index.html', 'utf8');
const blocks = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
  .filter(([, attrs, body]) => !/\bsrc\s*=/.test(attrs) && body.trim());
if (!blocks.length) throw new Error('No inline JavaScript blocks found.');
let failed = false;
for (let i = 0; i < blocks.length; i++) {
  try {
    new vm.Script(blocks[i][2], { filename: `index.html:inline-script-${i + 1}` });
    console.log(`PASS inline script ${i + 1}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL inline script ${i + 1}: ${error.message}`);
  }
}
const ids = [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
console.log(`Checked ${blocks.length} inline scripts and ${ids.length} literal HTML IDs.`);
if (duplicates.length) console.warn('Duplicate IDs to review:', duplicates.join(', '));
if (failed) process.exit(1);
