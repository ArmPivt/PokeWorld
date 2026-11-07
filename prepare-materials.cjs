const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const materials = [
  { id: 'adamant-mint', width: 160, height: 160 },
  { id: 'ability-capsule', width: 30, height: 30 },
  { id: 'ability-patch', width: 64, height: 64 },
  { id: 'heart-scale', width: 30, height: 30 },
  { id: 'bottle-cap', width: 30, height: 30 },
  { id: 'gold-bottle-cap', width: 30, height: 30 },
  { id: 'stardust', width: 30, height: 30 },
];
const sourceBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
const destination = path.join(__dirname, 'dist/client', 'assets', 'materials');
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function inspectPng(bytes, material) {
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature) ||
      bytes.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('Invalid PNG for ' + material.id);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== material.width || height !== material.height || bytes.length > 200000) {
    throw new Error('Unexpected dimensions or size for ' + material.id);
  }
  return { id: material.id, width, height, bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
}

async function prepare() {
  fs.mkdirSync(destination, { recursive: true });
  let next = 0;
  const results = [];
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (next < materials.length) {
      const material = materials[next++];
      const response = await fetch(sourceBase + material.id + '.png', {
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('image/png')) {
        throw new Error('Missing or invalid material icon: ' + material.id + ' HTTP ' + response.status);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const result = inspectPng(bytes, material);
      fs.writeFileSync(path.join(destination, material.id + '.png'), bytes);
      results.push(result);
    }
  }));
  const credits = [
    '# Icônes des objets d’amélioration',
    '',
    'Les sept icônes de ce dossier proviennent du dépôt [PokéAPI/sprites](https://github.com/PokeAPI/sprites), dossier `sprites/items`. Les fichiers sont conservés sans modification avec leur nom et leur résolution d’origine.',
    '',
    'La [licence du dépôt source](https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt) indique une distribution CC0 1.0 Universal tout en réservant les droits sur le contenu des images à The Pokémon Company. Pokémon et les objets associés : © The Pokémon Company / Nintendo / Creatures / GAME FREAK.',
    '',
    '| Fichier local | Dimensions | Source |',
    '| --- | --- | --- |',
    ...materials.map(m => '| `' + m.id + '.png` | ' + m.width + ' × ' + m.height + ' | [' + m.id + '](' + sourceBase + m.id + '.png) |'),
    '',
    'Reconstruction : `node prepare-materials.cjs`. Le script vérifie la réponse HTTP, la signature PNG et les dimensions avant chaque écriture.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(destination, 'CREDITS.md'), credits, 'utf8');
  for (const result of results.sort((a, b) => materials.findIndex(m => m.id === a.id) - materials.findIndex(m => m.id === b.id))) {
    console.log(JSON.stringify(result));
  }
  console.log('Verified ' + results.length + ' local material icons.');
}

prepare().catch(error => { console.error(error.message); process.exitCode = 1; });
