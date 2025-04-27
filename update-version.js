// smartUpdateManifestVersion.js
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
