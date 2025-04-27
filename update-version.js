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

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Obtener el nombre de la rama actual
  const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  // Comprobar si estamos en una rama release/
  const releaseBranchPattern = /^release\/(.+)$/;
  const match = branchName.match(releaseBranchPattern);

  if (!match) {
    console.error(`❌ No estás en una rama de release. Estás en: ${branchName}`);
    process.exit(1);
  }

  // Extraer versión de la rama
  const version = match[1];

  // Función para actualizar un archivo JSON
  const updateVersionInFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ No se encontró ${filePath}, se omite.`);
      return;
    }

    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (content.version !== version) {
      content.version = version;
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`✅ ${filePath} actualizado a versión ${version}`);
    } else {
      console.log(`ℹ️ ${filePath} ya está en la versión correcta (${version})`);
    }
  };

  // Actualizar manifest.json y package.json
  updateVersionInFile('./src/manifest.json');
  updateVersionInFile('./package.json');

} catch (error) {
  console.error('❌ Error actualizando archivos:', error);
}
