// Compile the two theme entry points straight into Typora's themes directory.
//   node scripts/build.mjs           # one-off build
//   node scripts/build.mjs --watch   # rebuild on any .scss change
//
// Override the output directory with TYPORA_THEMES (defaults to
// %APPDATA%\Typora\themes on Windows).
import fs from 'node:fs';
import path from 'node:path';
import * as sass from 'sass';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = process.env.TYPORA_THEMES
  || path.join(process.env.APPDATA || path.join(process.env.HOME || '.', '.config'), 'Typora', 'themes');

const TARGETS = [
  ['src/onelight.scss', 'onelight.css'],
  ['src/onelight-dark.scss', 'onelight-dark.css'],
];

function build() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(`themes directory not found: ${OUT_DIR}`);
    console.error('set TYPORA_THEMES to your Typora themes folder');
    process.exit(1);
  }
  const started = Date.now();
  for (const [input, output] of TARGETS) {
    const outFile = path.join(OUT_DIR, output);
    try {
      const { css } = sass.compile(path.join(ROOT, input), {
        style: 'expanded',
        sourceMap: false,
        // Keep emitted CSS stable across machines.
        charset: false,
      });
      fs.writeFileSync(outFile, css);
      console.log(`  ${output}  ${css.length} bytes`);
    } catch (err) {
      console.error(`  ${input} FAILED`);
      console.error(err.message);
      process.exitCode = 1;
    }
  }
  console.log(`built in ${Date.now() - started} ms -> ${OUT_DIR}`);
}

build();

if (process.argv.includes('--watch')) {
  let timer = null;
  let building = false;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (building) return;
      building = true;
      build();
      building = false;
    }, 120);
  };
  fs.watch(path.join(ROOT, 'src'), { recursive: true }, (_event, file) => {
    if (file && file.endsWith('.scss')) schedule();
  });
  console.log('watching src/ ...');
}