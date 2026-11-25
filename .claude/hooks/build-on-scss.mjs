// PostToolUse hook: rebuild the theme after any src/**/*.scss edit.
// Reads the hook payload from stdin and stays silent on success.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

let payload = {};
try { payload = JSON.parse(fs.readFileSync(0, 'utf8')); } catch {}

const file = payload?.tool_input?.file_path || payload?.tool_response?.filePath || '';
if (!/[\\/]src[\\/].+\.scss$/i.test(file)) process.exit(0);

const r = spawnSync('pnpm', ['build'], { cwd: ROOT, encoding: 'utf8', shell: true });
if (r.status !== 0) {
  process.stderr.write(
    `pnpm build failed after editing ${path.basename(file)}\n${r.stdout || ''}${r.stderr || ''}`
  );
  process.exit(1);
}
process.exit(0);