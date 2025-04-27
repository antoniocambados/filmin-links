/**
 * Filmin Links
 * Copyright (C) 2025  Antonio Cambados
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// zipDistFolder.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

async function getVersion() {
  try {
    // Primero obtenemos el nombre de la referencia actual
    const refName = execSync('git symbolic-ref --short HEAD || git describe --tags --exact-match', { encoding: 'utf8' }).trim();

    // ¿Estamos en una rama release/xxx?
    const releaseMatch = refName.match(/^release\/(.+)$/);
    if (releaseMatch) {
      return releaseMatch[1];
    }

    // ¿Estamos en una etiqueta/tag tipo v1.3.0?
    const tagMatch = refName.match(/^v?(\d+\.\d+\.\d+)$/);
    if (tagMatch) {
      return tagMatch[1];
    }

    console.error(`❌ No estás en una rama release/ ni en un tag válido (estás en: "${refName}").`);
    process.exit(1);
  } catch (err) {
    console.error('❌ Error detectando la versión:', err);
    process.exit(1);
  }
}

async function zipDist() {
  const distPath = path.resolve(__dirname, 'dist');
  const releaseDir = path.resolve(__dirname, 'release');

  if (!fs.existsSync(distPath)) {
    console.error('❌ No se encontró la carpeta dist/. Ejecuta primero npm run build.');
    process.exit(1);
  }

  if (!fs.existsSync(releaseDir)) {
    fs.mkdirSync(releaseDir);
  }

  const version = await getVersion();
  const zipPath = path.join(releaseDir, `extension-${version}.zip`);

  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`✅ Comprimido dist/ en ${zipPath} (${archive.pointer()} bytes)`);
  });

  archive.pipe(output);
  archive.directory(distPath, false);
  await archive.finalize();
}

zipDist().catch(err => {
  console.error('❌ Error al comprimir:', err);
});
