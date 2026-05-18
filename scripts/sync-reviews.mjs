#!/usr/bin/env node

import { access, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_SOURCES = [
  path.join(repoRoot, 'private', 'imports'),
  '/Users/runhua/OneDrive/work/review-paper',
  '/Users/runhua/obsidian/rx/1Work/03Academia/01 Review'
];

const OUTPUT_FILE = path.join(repoRoot, 'data', 'reviews.js');
const MAX_TEXT_BYTES = 768 * 1024;
const TEXT_EXTENSIONS = new Set(['.csv', '.tsv', '.md', '.markdown', '.txt', '.json']);
const CSV_JOURNAL_HEADERS = new Set([
  'journal',
  'journalname',
  'journaltitle',
  'source',
  'sourcetitle',
  'publication',
  'publicationname',
  'publicationtitle'
]);

const groups = [
  {
    id: 'security-privacy',
    label: 'Security & Privacy',
    icon: 'fas fa-shield-alt',
    featured: ['ieee-tifs', 'ieee-tdsc', 'acm-tops', 'cose']
  },
  {
    id: 'ai-data',
    label: 'AI & Data',
    icon: 'fas fa-brain',
    featured: ['ieee-tpami', 'ieee-tkde', 'ieee-tai', 'acm-tkdd']
  },
  {
    id: 'systems-computing',
    label: 'Systems & Computing',
    icon: 'fas fa-server',
    featured: ['ieee-tsc', 'ieee-tcc', 'ieee-tpds', 'ieee-tmc']
  },
  {
    id: 'networking-communications',
    label: 'Networking & Communications',
    icon: 'fas fa-network-wired',
    featured: ['ieee-jsac', 'ieee-tgcn', 'ieee-tnse', 'comnet']
  }
];

const curatedJournals = [
  ['ieee-tifs', 'IEEE Transactions on Information Forensics and Security', 'IEEE TIFS', 'security-privacy', ['IEEE Transactions on Information Forensics and Security', 'IEEE TIFS', 'TIFS']],
  ['ieee-tdsc', 'IEEE Transactions on Dependable and Secure Computing', 'IEEE TDSC', 'security-privacy', ['IEEE Transactions on Dependable and Secure Computing', 'IEEE TDSC', 'TDSC']],
  ['ieee-sp', 'IEEE Security & Privacy', 'IEEE S&P', 'security-privacy', ['IEEE Security & Privacy', 'IEEE Security and Privacy']],
  ['acm-dtrap', 'ACM Digital Threats: Research and Practice', 'ACM DTRAP', 'security-privacy', ['ACM Digital Threats', 'DTRAP']],
  ['acm-tops', 'ACM Transactions on Privacy and Security', 'ACM TOPS', 'security-privacy', ['ACM Transactions on Privacy and Security', 'ACM TOPS', 'TOPS']],
  ['cose', 'Computers & Security', 'COSE', 'security-privacy', ['Computers & Security', 'Computers and Security', 'COSE']],
  ['bra', 'Blockchain: Research and Applications', 'BRA', 'security-privacy', ['Blockchain: Research and Applications', 'Blockchain Research and Applications', 'BRA']],
  ['ieee-tpami', 'IEEE Transactions on Pattern Analysis and Machine Intelligence', 'IEEE TPAMI', 'ai-data', ['IEEE Transactions on Pattern Analysis and Machine Intelligence', 'IEEE TPAMI', 'TPAMI']],
  ['ieee-tkde', 'IEEE Transactions on Knowledge and Data Engineering', 'IEEE TKDE', 'ai-data', ['IEEE Transactions on Knowledge and Data Engineering', 'IEEE TKDE', 'TKDE']],
  ['ieee-tnnls', 'IEEE Transactions on Neural Networks and Learning Systems', 'IEEE TNNLS', 'ai-data', ['IEEE Transactions on Neural Networks and Learning Systems', 'IEEE TNNLS', 'TNNLS']],
  ['ieee-tai', 'IEEE Transactions on Artificial Intelligence', 'IEEE TAI', 'ai-data', ['IEEE Transactions on Artificial Intelligence', 'IEEE TAI']],
  ['ieee-intelligent-systems', 'IEEE Intelligent Systems', 'IEEE Intelligent Systems', 'ai-data', ['IEEE Intelligent Systems']],
  ['acm-tkdd', 'ACM Transactions on Knowledge Discovery from Data', 'ACM TKDD', 'ai-data', ['ACM Transactions on Knowledge Discovery from Data', 'ACM TKDD', 'TKDD']],
  ['information-sciences', 'Information Sciences', 'IS', 'ai-data', ['Information Sciences']],
  ['eswa', 'Expert Systems with Applications', 'ESWA', 'ai-data', ['Expert Systems with Applications', 'ESWA']],
  ['nepl', 'Neural Processing Letters', 'NEPL', 'ai-data', ['Neural Processing Letters', 'NEPL']],
  ['ieee-tsc', 'IEEE Transactions on Services Computing', 'IEEE TSC', 'systems-computing', ['IEEE Transactions on Services Computing', 'IEEE TSC']],
  ['ieee-tmc', 'IEEE Transactions on Mobile Computing', 'IEEE TMC', 'systems-computing', ['IEEE Transactions on Mobile Computing', 'IEEE TMC', 'TMC']],
  ['ieee-tc', 'IEEE Transactions on Computers', 'IEEE TC', 'systems-computing', ['IEEE Transactions on Computers', 'IEEE TC']],
  ['ieee-tpds', 'IEEE Transactions on Parallel and Distributed Systems', 'IEEE TPDS', 'systems-computing', ['IEEE Transactions on Parallel and Distributed Systems', 'IEEE TPDS', 'TPDS']],
  ['ieee-tcad', 'IEEE Transactions on Computer-Aided Design of Integrated Circuits and Systems', 'IEEE TCAD', 'systems-computing', ['IEEE Transactions on Computer-Aided Design of Integrated Circuits and Systems', 'IEEE TCAD', 'TCAD']],
  ['ieee-tii', 'IEEE Transactions on Industrial Informatics', 'IEEE TII', 'systems-computing', ['IEEE Transactions on Industrial Informatics', 'IEEE TII']],
  ['ieee-tce', 'IEEE Transactions on Consumer Electronics', 'IEEE TCE', 'systems-computing', ['IEEE Transactions on Consumer Electronics', 'IEEE TCE']],
  ['ieee-tetc', 'IEEE Transactions on Emerging Topics in Computing', 'IEEE TETC', 'systems-computing', ['IEEE Transactions on Emerging Topics in Computing', 'IEEE TETC', 'TETC']],
  ['ieee-tcc', 'IEEE Transactions on Cloud Computing', 'IEEE TCC', 'systems-computing', ['IEEE Transactions on Cloud Computing', 'IEEE TCC']],
  ['ieee-tbd', 'IEEE Transactions on Big Data', 'IEEE TBD', 'systems-computing', ['IEEE Transactions on Big Data', 'IEEE TBD']],
  ['acm-toit', 'ACM Transactions on Internet Technology', 'ACM TOIT', 'systems-computing', ['ACM Transactions on Internet Technology', 'ACM TOIT', 'TOIT']],
  ['computer', 'Computer', 'Computer', 'systems-computing', ['IEEE Computer', 'Computer Magazine']],
  ['fcs', 'Frontiers of Computer Science', 'FCS', 'systems-computing', ['Frontiers of Computer Science', 'FCS']],
  ['jcst', 'Journal of Computer Science and Technology', 'JCST', 'systems-computing', ['Journal of Computer Science and Technology', 'JCST']],
  ['tst', 'Tsinghua Science and Technology', 'TST', 'systems-computing', ['Tsinghua Science and Technology', 'TST']],
  ['ieee-jsac', 'IEEE Journal on Selected Areas in Communications', 'IEEE JSAC', 'networking-communications', ['IEEE Journal on Selected Areas in Communications', 'IEEE JSAC', 'JSAC']],
  ['ieee-tgcn', 'IEEE Transactions on Green Communications and Networking', 'IEEE TGCN', 'networking-communications', ['IEEE Transactions on Green Communications and Networking', 'IEEE TGCN', 'TGCN']],
  ['ieee-tnse', 'IEEE Transactions on Network Science and Engineering', 'IEEE TNSE', 'networking-communications', ['IEEE Transactions on Network Science and Engineering', 'IEEE TNSE', 'TNSE']],
  ['comnet', 'Computer Networks', 'COMNET', 'networking-communications', ['Computer Networks', 'COMNET']],
  ['pmc', 'Pervasive and Mobile Computing', 'PMC', 'networking-communications', ['Pervasive and Mobile Computing', 'PMC']],
  ['ipl', 'Information Processing Letters', 'IPL', 'other', ['Information Processing Letters', 'IPL']]
].map(([id, name, abbr, category, aliases]) => ({ id, name, abbr, category, aliases }));

const normalize = (value) => String(value || '')
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '');

const slugify = (value) => normalize(value).replace(/^the/, '').slice(0, 64) || 'journal';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const sources = [];
  let out = OUTPUT_FILE;
  let useDefaults = true;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--source' && args[index + 1]) {
      sources.push(path.resolve(args[index + 1]));
      index += 1;
    } else if (arg === '--out' && args[index + 1]) {
      out = path.resolve(args[index + 1]);
      index += 1;
    } else if (arg === '--no-defaults') {
      useDefaults = false;
    } else if (arg === '--help') {
      console.log('Usage: node scripts/sync-reviews.mjs [--source <path>] [--out <file>] [--no-defaults]');
      process.exit(0);
    } else {
      sources.push(path.resolve(arg));
    }
  }

  return {
    out,
    sources: [...(useDefaults ? DEFAULT_SOURCES : []), ...sources]
  };
};

const fileExists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const walk = async (target, files = []) => {
  if (!(await fileExists(target))) return files;

  const info = await stat(target);
  if (info.isFile()) {
    files.push(target);
    return files;
  }

  if (!info.isDirectory()) return files;

  const entries = await readdir(target, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    await walk(path.join(target, entry.name), files);
  }

  return files;
};

const parseDelimited = (text, delimiter) => {
  const rows = [];
  let current = '';
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(current.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  row.push(current.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
};

const guessCategory = (name) => {
  const value = normalize(name);
  if (/security|privacy|forensic|dependable|blockchain|threat/.test(value)) return 'security-privacy';
  if (/artificial|intelligence|pattern|neural|knowledge|data|expert|information/.test(value)) return 'ai-data';
  if (/network|communication|mobile|pervasive/.test(value)) return 'networking-communications';
  if (/comput|cloud|service|parallel|distributed|industrial|system/.test(value)) return 'systems-computing';
  return 'other';
};

const cleanJournalName = (value) => String(value || '')
  .replace(/\s+/g, ' ')
  .replace(/^["']|["']$/g, '')
  .trim();

const isSafeJournalCandidate = (value) => {
  const name = cleanJournalName(value);
  if (!name || name.length < 4 || name.length > 140) return false;
  if (/[?]|\babstract\b|\bmanuscript title\b/i.test(name)) return false;
  return /journal|transactions|letters|magazine|security|comput|network|information|science|systems|applications|communications|blockchain|privacy|data|artificial|intelligence|ieee|acm/i.test(name);
};

const extractStructuredJournals = (file, text) => {
  const extension = path.extname(file).toLowerCase();
  const journals = [];

  if (extension === '.csv' || extension === '.tsv') {
    const delimiter = extension === '.tsv' ? '\t' : ',';
    const rows = parseDelimited(text, delimiter);
    const header = rows[0] || [];
    const normalizedHeader = header.map(normalize);
    const journalColumnIndexes = normalizedHeader
      .map((headerName, index) => CSV_JOURNAL_HEADERS.has(headerName) ? index : -1)
      .filter((index) => index >= 0);

    for (const row of rows.slice(1)) {
      for (const index of journalColumnIndexes) {
        if (isSafeJournalCandidate(row[index])) journals.push(cleanJournalName(row[index]));
      }
    }
  } else {
    const linePattern = /^\s*(journal|venue|source|publication|journal name|source title)\s*[:：]\s*(.+?)\s*$/gim;
    let match = linePattern.exec(text);
    while (match) {
      if (isSafeJournalCandidate(match[2])) journals.push(cleanJournalName(match[2]));
      match = linePattern.exec(text);
    }
  }

  return journals;
};

const readText = async (file) => {
  const extension = path.extname(file).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) return '';

  const info = await stat(file);
  if (info.size > MAX_TEXT_BYTES) return '';

  try {
    return await readFile(file, 'utf8');
  } catch {
    return '';
  }
};

const loadExtraJournals = async () => {
  const extraPath = path.join(repoRoot, 'private', 'imports', 'review-journals.json');
  if (!(await fileExists(extraPath))) return [];

  try {
    const parsed = JSON.parse(await readFile(extraPath, 'utf8'));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && isSafeJournalCandidate(item.name))
      .map((item) => ({
        id: item.id || slugify(item.abbr || item.name),
        name: cleanJournalName(item.name),
        abbr: cleanJournalName(item.abbr || item.name),
        category: item.category || guessCategory(item.name),
        aliases: Array.isArray(item.aliases) ? item.aliases : [item.name, item.abbr].filter(Boolean)
      }));
  } catch (error) {
    console.warn(`Skipping invalid ${extraPath}: ${error.message}`);
    return [];
  }
};

const makeOutput = (journals, detected, scannedSources) => {
  const groupIndex = (category) => {
    const index = groups.findIndex((group) => group.id === category);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  const journalList = journals
    .map((journal) => ({
      id: journal.id,
      name: journal.name,
      abbr: journal.abbr,
      category: journal.category
    }))
    .sort((left, right) => {
      const groupOrder = groupIndex(left.category) - groupIndex(right.category);
      return groupOrder || left.abbr.localeCompare(right.abbr);
    });

  return {
    summary: 'Reviewed for leading journals across security, privacy, AI, data, networking, distributed systems, and emerging computing.',
    generatedAt: new Date().toISOString().slice(0, 10),
    groups,
    journals: journalList
  };
};

const main = async () => {
  const { out, sources } = parseArgs();
  const extras = await loadExtraJournals();
  const journalMap = new Map([...curatedJournals, ...extras].map((journal) => [journal.id, journal]));
  const detected = new Map();
  const scannedSources = [];

  for (const source of sources) {
    const files = await walk(source);
    if (files.length) scannedSources.push(source);

    for (const file of files) {
      const text = await readText(file);
      const searchable = `${file}\n${text}`;
      const normalized = normalize(searchable);
      const years = [...new Set((searchable.match(/\b20\d{2}\b/g) || []))];

      for (const journal of journalMap.values()) {
        if (journal.aliases.some((alias) => alias && normalized.includes(normalize(alias)))) {
          if (!detected.has(journal.id)) detected.set(journal.id, { years: new Set() });
          years.forEach((year) => detected.get(journal.id).years.add(year));
        }
      }

      for (const journalName of extractStructuredJournals(file, text)) {
        const existing = [...journalMap.values()].find((journal) => normalize(journal.name) === normalize(journalName) || normalize(journal.abbr) === normalize(journalName));
        const journal = existing || {
          id: slugify(journalName),
          name: cleanJournalName(journalName),
          abbr: cleanJournalName(journalName),
          category: guessCategory(journalName),
          aliases: [journalName]
        };

        journalMap.set(journal.id, journal);
        if (!detected.has(journal.id)) detected.set(journal.id, { years: new Set() });
        years.forEach((year) => detected.get(journal.id).years.add(year));
      }
    }
  }

  const output = makeOutput([...journalMap.values()], detected, scannedSources);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `// Generated by scripts/sync-reviews.mjs. Public summary only; do not add manuscript details here.\nwindow.siteReviews = ${JSON.stringify(output, null, 4)};\n`);

  console.log(`Wrote ${path.relative(repoRoot, out)} with ${output.journals.length} journals.`);
  console.log(`Scanned ${scannedSources.length} source root(s).`);
  if (detected.size) console.log(`Matched ${detected.size} journal(s) from local sources.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
