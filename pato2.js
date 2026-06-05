#!/usr/bin/env node
/**
 * pato2.js — CLI helper para PatoII.html
 * Uso: node pato2.js <comando> [args]
 */
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const HTML_PATH = 'C:\\Users\\lunom\\OneDrive\\Escritorio\\tri 10\\PatoII.html';
const GH_PATH   = 'C:\\Users\\lunom\\OneDrive\\Documents\\GitHub\\Pato-II\\PatoII.html';

function readHTML() {
  return fs.readFileSync(HTML_PATH, 'utf8').replace(/\r\n/g, '\n');
}

function writeHTML(c) {
  fs.writeFileSync(HTML_PATH + '.tmp', c, 'utf8');
  fs.renameSync(HTML_PATH + '.tmp', HTML_PATH);
}

function getJS(html) {
  const start = html.indexOf('const imagesMap');
  const end = html.indexOf('];', html.indexOf('const diseases')) + 2;
  return html.substring(start, end).replace(/const /g, 'var ');
}

function evalData(html) {
  const js = getJS(html);
  return new Function(js + '\nreturn {imagesMap: imagesMap, diseases: diseases};')();
}

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

const COMMANDS = {

  // ── CONTRASEÑAS ─────────────────────────────────────────────────────────────

  'add-password': (args) => {
    const [code, expires] = args;
    if (!code || !expires) return console.error('Uso: add-password CODIGO "YYYY-MM-DDTHH:MM:SS"');
    const upper = code.toUpperCase();
    const hash = sha256(upper);
    let c = readHTML();
    if (c.includes(hash)) return console.error('ERROR: ese código ya existe en el HTML.');
    const newLine = `    { hash: '${hash}', expires: '${expires}' },`;
    // Insertar antes del cierre del array codes
    const target = '  ]\n};';
    if (!c.includes(target)) return console.error('ERROR: no encontré el cierre del ACCESS_CFG.');
    c = c.replace(target, newLine + '\n  ]\n};');
    writeHTML(c);
    console.log(`✓ Código creado: ${upper}`);
    console.log(`  Hash: ${hash}`);
    console.log(`  Vence: ${expires}`);
  },

  'list-passwords': (_) => {
    const c = readHTML();
    const ownerMatch = c.match(/ownerHash:\s*'([^']+)'/);
    const codes = [...c.matchAll(/\{\s*hash:\s*'([^']+)',\s*expires:\s*'([^']+)'\s*\}/g)];
    console.log('=== ACCESS_CFG ===');
    if (ownerMatch) console.log(`ownerHash (permanente): ${ownerMatch[1]}`);
    codes.forEach((m, i) => {
      const expired = new Date(m[2]) < new Date() ? ' ⚠ VENCIDO' : '';
      console.log(`[${i+1}] hash: ${m[1].substring(0,16)}... | expires: ${m[2]}${expired}`);
    });
  },

  'remove-password': (args) => {
    const [input] = args;
    if (!input) return console.error('Uso: remove-password HASH_COMPLETO_O_CODIGO');
    const hash = input.length === 64 ? input : sha256(input.toUpperCase());
    let c = readHTML();
    const re = new RegExp(`\\s*\\{\\s*hash:\\s*'${hash}'[^}]*\\},?\\n?`, 'g');
    if (!re.test(c)) return console.error('ERROR: hash no encontrado en el HTML.');
    c = c.replace(new RegExp(`\\s*\\{\\s*hash:\\s*'${hash}'[^}]*\\},?\\n?`, 'g'), '\n');
    writeHTML(c);
    console.log(`✓ Código eliminado (hash: ${hash.substring(0,16)}...)`);
  },

  // ── IMÁGENES ─────────────────────────────────────────────────────────────────

  'list-images': (args) => {
    const [id] = args;
    if (!id) return console.error('Uso: list-images id_enfermedad');
    const c = readHTML();
    const { imagesMap } = evalData(c);
    const imgs = imagesMap[id];
    if (!imgs) return console.error(`ERROR: '${id}' no encontrado en imagesMap.`);
    console.log(`=== ${id} (${imgs.length} imágenes) ===`);
    imgs.forEach((img, i) => console.log(`  [${i+1}] ${path.basename(img)}`));
  },

  'remove-image': (args) => {
    const [id, filename] = args;
    if (!id || !filename) return console.error('Uso: remove-image id_enfermedad nombre_archivo.png');
    let c = readHTML();
    const { imagesMap } = evalData(c);
    if (!imagesMap[id]) return console.error(`ERROR: '${id}' no encontrado.`);
    const before = imagesMap[id].length;
    const filtered = imagesMap[id].filter(img => path.basename(img) !== filename);
    if (filtered.length === before) return console.error(`ERROR: '${filename}' no encontrado en ${id}.`);
    // Reemplazar el array en el HTML
    const oldArr = JSON.stringify(imagesMap[id]);
    const newArr = JSON.stringify(filtered);
    if (!c.includes(oldArr)) return console.error('ERROR: no pude ubicar el array exacto en el HTML (caracteres especiales?)');
    c = c.replace(oldArr, newArr);
    writeHTML(c);
    console.log(`✓ Eliminado '${filename}' de '${id}'. Quedan ${filtered.length} imágenes.`);
  },

  'add-images': (args) => {
    const [id, ...newImgs] = args;
    if (!id || !newImgs.length) return console.error('Uso: add-images id_enfermedad "ruta1.png" "ruta2.png"...');
    let c = readHTML();
    const { imagesMap } = evalData(c);
    if (!imagesMap[id]) return console.error(`ERROR: '${id}' no encontrado.`);
    const oldArr = JSON.stringify(imagesMap[id]);
    const newArr = JSON.stringify([...imagesMap[id], ...newImgs]);
    if (!c.includes(oldArr)) return console.error('ERROR: no pude ubicar el array exacto en el HTML.');
    c = c.replace(oldArr, newArr);
    writeHTML(c);
    console.log(`✓ Añadidas ${newImgs.length} imágenes a '${id}'. Total: ${imagesMap[id].length + newImgs.length}.`);
  },

  // ── UTILIDADES ───────────────────────────────────────────────────────────────

  'validate': (_) => {
    const c = readHTML();
    try {
      const { imagesMap, diseases } = evalData(c);
      const noImgs = diseases.filter(d => !(imagesMap[d.id]||[]).length);
      console.log(`✓ JS válido`);
      console.log(`  diseases: ${diseases.length}`);
      console.log(`  imagesMap keys: ${Object.keys(imagesMap).length}`);
      if (noImgs.length) console.log(`  Sin imágenes: ${noImgs.map(d=>d.id).join(', ')}`);
      const mismatch = Object.keys(imagesMap).filter(k => !diseases.find(d=>d.id===k));
      if (mismatch.length) console.log(`  En mapa pero no en diseases: ${mismatch.join(', ')}`);
    } catch(e) {
      console.error(`✗ ERROR JS: ${e.message}`);
    }
  },

  'sync': (_) => {
    const c = fs.readFileSync(HTML_PATH, 'utf8');
    fs.writeFileSync(GH_PATH, c, 'utf8');
    console.log('✓ HTML sincronizado a GitHub local.');
  },

  'stats': (_) => {
    const c = readHTML();
    const { diseases } = evalData(c);
    const bySys = {};
    diseases.forEach(d => { bySys[d.system] = (bySys[d.system]||0) + 1; });
    console.log(`=== PatoII Stats ===`);
    console.log(`Total enfermedades: ${diseases.length}`);
    Object.entries(bySys).sort().forEach(([s,n]) => console.log(`  ${s}: ${n}`));
  },

  'help': (_) => {
    console.log(`
pato2.js — CLI helper para PatoII

CONTRASEÑAS:
  add-password <CODIGO> "<YYYY-MM-DDTHH:MM:SS>"   Crear código (se hashea automático)
  list-passwords                                    Ver todos los códigos
  remove-password <HASH_O_CODIGO>                   Eliminar código

IMÁGENES:
  list-images <id>                                  Ver imágenes de una enfermedad
  remove-image <id> <archivo.png>                   Eliminar imagen del HTML (no del disco)
  add-images <id> "ruta1.png" "ruta2.png"...       Añadir imágenes a enfermedad existente

UTILIDADES:
  validate                                          Verificar JS válido y contar enfermedades
  sync                                              Copiar HTML de tri10 al GitHub local
  stats                                             Estadísticas por sistema
  help                                              Esta ayuda
`);
  }
};

const [,, cmd, ...args] = process.argv;
if (!cmd || !COMMANDS[cmd]) {
  console.error(`Comando desconocido: '${cmd || ''}'. Usa: node pato2.js help`);
  process.exit(1);
}
COMMANDS[cmd](args);
