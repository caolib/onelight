// Preview Typora theme builds without restarting Typora.
// The compiled CSS is a single file, so a preview is just a cache-busted reload
// of Typora's own <link>, followed by a screenshot.
//
// Usage:
//   node dev/cdp.mjs reload            # reload the active theme stylesheet
//   node dev/cdp.mjs shot [out.png]    # reload + screenshot (default dev/shot.png)
//   node dev/cdp.mjs watch             # reload + screenshot whenever the built CSS changes
//   node dev/cdp.mjs eval "<js>"
//   node dev/cdp.mjs dom [selector] [depth]
//   node dev/cdp.mjs html [selector]
//   node dev/cdp.mjs hover <selector>
//   node dev/cdp.mjs click <selector>
//   node dev/cdp.mjs unhover
//
// Requires Typora running with --remote-debugging-port=9222 (see dev/README.md).
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.TYPORA_CDP_PORT || 9222);
const ROOT = path.resolve(import.meta.dirname, '..');
const THEMES = process.env.TYPORA_THEMES
  || path.join(process.env.APPDATA || path.join(process.env.HOME || '.', '.config'), 'Typora', 'themes');

async function pickTarget() {
  const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  const list = await res.json();
  const page = list.find(t => t.type === 'page' && /window\.html/.test(t.url))
    || list.find(t => t.type === 'page' && t.title === 'Typora');
  if (!page) throw new Error('Typora editor page not found. Is Typora running with remote debugging?');
  return page;
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async evalExpr(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true, userGesture: true,
    });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + JSON.stringify(r.exceptionDetails.exception?.description || ''));
    return r.result?.value;
  }
}

async function connect() {
  const target = await pickTarget();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  return { cdp, ws };
}

// Force Typora to re-read the theme <link> by appending a cache-busting query.
// Also removes any leftover dev-injected <style> from older tooling.
async function reloadTheme(cdp) {
  return cdp.evalExpr(`(() => {
    document.getElementById('__typora_dev_css')?.remove();
    const links = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .filter(l => /userData[\\\\/]themes[\\\\/][^\\\\/]+\\.css(\\?.*)?$/i.test(l.getAttribute('href') || ''));
    const touched = [];
    for (const l of links) {
      const base = (l.href || l.getAttribute('href') || '').split('?')[0];
      l.href = base + '?t=' + Date.now();
      touched.push(base);
    }
    return { touched, title: document.title, write: !!document.getElementById('write') };
  })()`);
}

async function shot(cdp, out) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(out, Buffer.from(data, 'base64'));
  return out;
}

async function targetCenter(cdp, sel) {
  const prep = await cdp.evalExpr(`(() => {
    const el = document.querySelector(${JSON.stringify(sel)});
    if (!el) return null;
    el.scrollIntoView({ block: 'center', inline: 'center' });
    return { tag: el.tagName, id: el.id, cls: String(el.className).slice(0, 80),
             text: (el.textContent || '').trim().slice(0, 60) };
  })()`);
  if (!prep) throw new Error('selector not found: ' + sel);
  await new Promise(r => setTimeout(r, 120));
  const rect = await cdp.evalExpr(`(() => {
    const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
  })()`);
  return { ...prep, ...rect };
}

async function mouseMove(cdp, x, y) {
  await cdp.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved', x, y, button: 'none', buttons: 0, pointerType: 'mouse',
  });
}

async function clickAt(cdp, x, y) {
  await mouseMove(cdp, x, y);
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1, pointerType: 'mouse' });
  await new Promise(r => setTimeout(r, 40));
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1, pointerType: 'mouse' });
}

async function domTree(cdp, sel, depth) {
  return cdp.evalExpr(`(() => {
    const sel = ${JSON.stringify(sel)};
    const root = document.querySelector(sel);
    if (!root) return 'not found: ' + sel;
    const lines = [];
    (function walk(el, d, prefix) {
      if (d > ${depth}) return;
      const tag = el.tagName.toLowerCase();
      const id = el.id ? '#' + el.id : '';
      const cls = el.classList.length ? '.' + [...el.classList].slice(0, 4).join('.') : '';
      const leaf = el.children.length === 0;
      const text = leaf ? '  "' + (el.textContent || '').trim().slice(0, 50) + '"' : '';
      lines.push(prefix + tag + id + cls + text);
      for (const c of el.children) walk(c, d + 1, prefix + '  ');
    })(root, 0, '');
    return lines.join('\\n');
  })()`);
}

const cmd = process.argv[2] || 'help';
const { cdp, ws } = await connect();

try {
  if (cmd === 'eval') {
    console.log(await cdp.evalExpr(process.argv[3] || '1+1'));
  } else if (cmd === 'dom') {
    console.log(await domTree(cdp, process.argv[3] || '#write', Number(process.argv[4] ?? 3)));
  } else if (cmd === 'html') {
    console.log(await cdp.evalExpr(`(document.querySelector(${JSON.stringify(process.argv[3] || '#write')}) || {}).outerHTML || 'not found'`));
  } else if (cmd === 'hover' || cmd === 'click') {
    const sel = process.argv[3];
    if (!sel) throw new Error(`usage: node dev/cdp.mjs ${cmd} <selector>`);
    const t = await targetCenter(cdp, sel);
    if (cmd === 'hover') await mouseMove(cdp, t.x, t.y);
    else await clickAt(cdp, t.x, t.y);
    console.log(`${cmd}: <${t.tag.toLowerCase()}${t.id ? '#' + t.id : ''}> at (${Math.round(t.x)}, ${Math.round(t.y)})${t.text ? ' "' + t.text + '"' : ''}`);
  } else if (cmd === 'unhover') {
    await mouseMove(cdp, 2, 2);
    console.log('mouse moved to (2, 2)');
  } else if (cmd === 'reload') {
    console.log(JSON.stringify(await reloadTheme(cdp)));
  } else if (cmd === 'shot') {
    const out = process.argv[3] || path.join(ROOT, 'dev', 'shot.png');
    console.log(JSON.stringify(await reloadTheme(cdp)));
    await new Promise(r => setTimeout(r, 250));
    await shot(cdp, out);
    console.log(out);
  } else if (cmd === 'watch') {
    const out = path.join(ROOT, 'dev', 'shot.png');
    let timerId = null;
    const fire = (name) => {
      clearTimeout(timerId);
      timerId = setTimeout(async () => {
        try {
          await reloadTheme(cdp);
          await new Promise(r => setTimeout(r, 250));
          await shot(cdp, out);
          console.log(`[${new Date().toLocaleTimeString()}] ${name} -> reloaded, ${out}`);
        } catch (e) { console.error('reload failed:', e.message); }
      }, 120);
    };
    fs.watch(THEMES, (_ev, f) => {
      if (f && /^onelight(-dark)?\.css$/i.test(f)) fire(f);
    });
    await reloadTheme(cdp);
    await shot(cdp, out);
    console.log(`watching ${THEMES}  -> ${out}`);
    await new Promise(() => {});
  } else {
    console.log('commands: reload | shot [out.png] | watch | eval <js> | dom [sel] [depth] | html [sel] | hover <sel> | click <sel> | unhover');
  }
} finally {
  if (cmd !== 'watch') ws.close();
}