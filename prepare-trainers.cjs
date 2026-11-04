const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const trainerIds = [
  'red-gen3', 'leaf-gen3', 'brendan-gen3', 'may-gen3',
  'lucas', 'dawn', 'ethan', 'lyra', 'hilbert', 'hilda',
  'nate', 'rosa', 'acetrainer', 'acetrainerf',
];
const sourceBase = 'https://play.pokemonshowdown.com/sprites/trainers/';
const destination = path.join(__dirname, 'dist', 'assets', 'trainers');
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function inspectPng(bytes, id) {
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(pngSignature) ||
      bytes.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('Invalid PNG for ' + id);
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== 80 || height !== 80 || bytes.length > 200000) {
    throw new Error('Unexpected sprite dimensions or size for ' + id);
  }
  return { id, width, height, bytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
}

async function prepare() {
  fs.mkdirSync(destination, { recursive: true });
  let next = 0;
  const results = [];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < trainerIds.length) {
      const id = trainerIds[next++];
      const response = await fetch(sourceBase + id + '.png', {
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('image/png')) {
        throw new Error('Sprite download failed: ' + id + ' HTTP ' + response.status);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      const result = inspectPng(bytes, id);
      fs.writeFileSync(path.join(destination, id + '.png'), bytes);
      results.push(result);
    }
  }));
  const credits = [
    '# Sprites de dresseurs',
    '',
    'Ces 14 fichiers PNG sont distribués par Pokémon Showdown. Ils sont conservés sans modification, à leur résolution source de 80 × 80 pixels.',
    '',
    'Pokémon et les personnages associés : © Nintendo / Creatures / GAME FREAK / The Pokémon Company. La licence MIT du code du dépôt Smogon ne transfère pas les droits sur les sprites.',
    '',
    'Sources et conditions :',
    '',
    '- [Catalogue officiel de distribution des sprites de dresseurs Pokémon Showdown](https://play.pokemonshowdown.com/sprites/trainers/). Le catalogue demande de créditer les artistes des créations communautaires et de ne pas modifier leurs images sans permission. Les entrées précises ci-dessous ne portent pas de crédit communautaire dans le catalogue consulté le 4 novembre 2026.',
    '- [Dépôt Smogon / Pokémon Showdown : droits des sprites](https://github.com/smogon/sprites#license).',
    '',
    '| Fichier local | Fichier source |',
    '| --- | --- |',
    ...trainerIds.map(id => '| `' + id + '.png` | [' + id + '](' + sourceBase + id + '.png) |'),
    '',
    'Reconstruction : exécuter `node prepare-trainers.cjs` à la racine du projet. Le script vérifie la signature PNG, les dimensions et la taille avant de sauvegarder chaque fichier.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(destination, 'CREDITS.md'), credits, 'utf8');
  for (const result of results.sort((a, b) => trainerIds.indexOf(a.id) - trainerIds.indexOf(b.id))) {
    console.log(JSON.stringify(result));
  }
  console.log('Verified ' + results.length + ' local trainer sprites.');
}

prepare().catch(error => { console.error(error.message); process.exitCode = 1; });
