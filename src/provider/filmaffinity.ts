export enum SearchType {
  all = 'all',
  title = 'title',
  director = 'director',
  cast = 'cast',
}

/**
 * Construye la URL de búsqueda en Filmaffinity.
 *
 * @param search Texto de la búsqueda
 * @param type Tipo de búsqueda
 */
export function makeUrl(search: string, type: SearchType = SearchType.all): string {
  return `https://www.filmaffinity.com/es/search.php?stext=${encodeURIComponent(search)}&stype=${type}`
}

/**
 * Crea un botón de enlace a la URL con las clases especificadas.
 *
 * @param url URL del enlace
 * @param extraClasses Clases adicionales
 */
export function makeButton(url: string, extraClasses: string = ''): HTMLAnchorElement {
  const link: HTMLAnchorElement = document.createElement('a')
  const icon: HTMLSpanElement = document.createElement('span')
  icon.textContent = 'FA'
  link.appendChild(icon)
  link.href = url
  link.target = '_blank'
  link.className = `fa-button ${extraClasses}`.trim()
  // Evita la propagación del evento click si el enlace está dentro de otro enlace.
  link.addEventListener('click', (event): void => event.stopPropagation())
  return link
}
