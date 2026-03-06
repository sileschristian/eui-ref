#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import * as readline from 'readline';
import Fuse from 'fuse.js';
import chalk from 'chalk';

function copyToClipboard(text) {
  try { execSync('pbcopy', { input: text }); return true; }
  catch { return false; }
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
  });
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = join(__dirname, 'eui-index.json');

const args = process.argv.slice(2);
const query = args.filter(a => !a.startsWith('--')).join(' ');
const showAll = args.includes('--all');
const listFlag = args.includes('--list');

if (!query && !listFlag) {
  console.log(chalk.bold('\n  EUI Component Lookup\n'));
  console.log('  ' + chalk.cyan('eui <query>') + '           Search components');
  console.log('  ' + chalk.cyan('eui <query> --all') + '     Show all matches');
  console.log('  ' + chalk.cyan('eui --list') + '            Browse all by category');
  console.log('\n  Examples:');
  console.log('  ' + chalk.dim('eui button'));
  console.log('  ' + chalk.dim('eui flyout'));
  console.log('  ' + chalk.dim('eui modal'));
  console.log('  ' + chalk.dim('eui empty state'));
  console.log();
  process.exit(0);
}

let index;
try {
  index = JSON.parse(readFileSync(indexPath, 'utf8'));
} catch {
  console.error(chalk.red('Could not load eui-index.json'));
  process.exit(1);
}

if (listFlag) {
  const byCategory = {};
  for (const [name, data] of Object.entries(index)) {
    const cat = data.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(name);
  }
  console.log(chalk.bold('\n  EUI Components\n'));
  for (const [cat, names] of Object.entries(byCategory)) {
    console.log('  ' + chalk.yellow.bold(cat));
    for (const name of names) console.log('    ' + chalk.cyan(name));
    console.log();
  }
  process.exit(0);
}

const list = Object.entries(index).map(([name, data]) => ({
  name, ...data,
  searchText: [name, ...(data.aliases || [])].join(' '),
}));

const fuse = new Fuse(list, {
  keys: [{ name: 'name', weight: 2 }, { name: 'searchText', weight: 1 }],
  threshold: 0.4,
  includeScore: true,
});

const results = fuse.search(query);

if (!results.length) {
  console.log(chalk.red(`\n  No component found for "${query}"\n`));
  console.log('  ' + chalk.dim('Try: eui --list'));
  console.log();
  process.exit(1);
}

const toShow = showAll ? results.slice(0, 8) : results.slice(0, 1);

// ── display ───────────────────────────────────────────────────────────────────
for (const { item } of toShow) {
  console.log();
  console.log('  ' + chalk.bold.cyan(item.name) + chalk.dim('  ' + item.category));
  console.log();
  console.log('  ' + chalk.yellow('Import'));
  console.log('  ' + chalk.white(item.import));
  console.log('  ' + chalk.dim('// ' + item.docs));

  if (item.keyProps && item.keyProps.length) {
    console.log();
    console.log('  ' + chalk.yellow('Key props'));
    for (const p of item.keyProps) {
      console.log('  ' + chalk.magenta(p.name) + chalk.dim('=' + p.values + '  ' + p.desc));
    }
  }

  if (item.variants && item.variants.length) {
    console.log();
    console.log('  ' + chalk.yellow('Variants'));
    item.variants.forEach((v, i) => {
      console.log('  ' + chalk.dim(`${i + 1}.`) + ' ' + chalk.white(v.name) + '  ' + chalk.dim(v.desc));
    });
  }

  console.log();
  console.log('  ' + chalk.blue('Docs  ') + chalk.underline.white(item.docs));
  if (showAll && toShow.length > 1) console.log();
}

// ── copy flow ─────────────────────────────────────────────────────────────────
const item = toShow[0].item;

// Always copy import + docs as baseline
copyToClipboard(`${item.import}\n// ${item.docs}`);
console.log('\n  ' + chalk.dim('import + docs copied'));

// If variants exist, prompt for specific one
if (item.variants && item.variants.length) {
  const validNums = item.variants.map((_, i) => String(i + 1));

  const answer = await ask(
    '\n  ' + chalk.bold('Copy variant reference?') +
    chalk.dim('  (' + validNums.join(', ') + ' · enter to skip) › ')
  );

  if (answer && validNums.includes(answer)) {
    const chosen = item.variants[parseInt(answer) - 1];
    const variantUrl = chosen.url || item.docs;
    const note = chosen.note || chosen.name;
    copyToClipboard(`${item.import}\n// ${note}\n// Docs: ${variantUrl}`);
    console.log('\n  ' + chalk.green('✓') + ' ' + chalk.bold(chosen.name));
    console.log('  ' + chalk.dim(note));
    console.log('  ' + chalk.dim('Docs: ' + variantUrl + '\n'));
  } else {
    console.log();
  }
} else {
  console.log();
}
