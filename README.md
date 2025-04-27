# Filmin Links

Filmin Links es una extensión para navegadores web que mejora la experiencia en 
[Filmin](https://www.filmin.es) añadiendo enlaces a diversas plataformas
cinematográficas.

## Descripción

Esta extensión mejora tu experiencia en [Filmin](https://www.filmin.es),
conectándola con un universo cinematográfico más amplio. Al navegar por 
películas o series en Filmin, la extensión añade automáticamente enlaces útiles
a las plataformas de votación e información cinematográfica más populares, donde
puedes encontrar más información, críticas y valoraciones del contenido que 
estás viendo.

Sitúate en (casi cualquier) póster, título, director o persona de reparto y
aparecerá un _popover_ con los enlaces para consultar el dato en cualquiera de 
las plataformas que hayas activado.

## Características

- Añade enlaces externos a:
  - [FilmAffinity](https://www.filmaffinity.com/)
  - [IMDb](https://www.imdb.com/)
  - [Letterboxd](https://letterboxd.com/)
  - [Rotten Tomatoes](https://www.rottentomatoes.com/)
- Personaliza qué plataformas quieres mostrar y en qué orden
- Compatible con Firefox y navegadores basados en Chromium (Chrome, Edge, Opera, etc.)
- Interfaz limpia e integrada con el diseño de Filmin
- Usa Manifest v3

## Requisitos previos

- Node.js 14 o superior
- npm o yarn

## Instalación para desarrollo

1. Clona este repositorio:
   ```bash
   git clone https://github.com/antoniocambados/filmin-links.git
   cd filmin-links
   ```

2. Instala las dependencias:
   ```bash
   yarn install
   ```

3. Construye la extensión:
   ```bash
   yarn build
   ```

## Cómo instalar la extensión en modo desarrollo en tu navegador

### Firefox

1. Abre Firefox y navega a `about:debugging`
2. Haz clic en "Este Firefox"
3. Haz clic en "Cargar complemento temporal..."
4. Selecciona el archivo `manifest.json` dentro de la carpeta `dist`

### Chrome / Edge / Opera

1. Abre tu navegador y navega a la página de extensiones:
  - Chrome: `chrome://extensions`
  - Edge: `edge://extensions`
  - Opera: `opera://extensions`
2. Activa el "Modo desarrollador"
3. Haz clic en "Cargar descomprimida"
4. Selecciona la carpeta `dist`

## Comandos disponibles

### Construir la extensión
   ```bash
   yarn build
   ```

### Ejecutar modo de desarrollo con reconstrucción automática
   ```bash
   yarn dev
   ```

### Formatear código
   ```bash
   yarn format
   ```

## Compatibilidad

- **Firefox**: Versión 121 o superior
- **Chrome/Edge/Opera**: Versión 121 o superior de Chromium

## Licencia

Este proyecto está licenciado bajo [GPLv3](./LICENSE.txt).

## Autor

Antonio Cambados - [GitHub](https://github.com/antoniocambados)

