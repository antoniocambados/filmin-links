/**
 * Tipos de búsqueda disponibles para los proveedores de cine.
 *
 * Estas categorías permiten búsquedas específicas en diferentes secciones de
 * las plataformas.
 */
export enum SearchType {
  all = 'all', // Búsqueda general en todos los campos
  title = 'title', // Búsqueda específica por título de película
  director = 'director', // Búsqueda por nombre de director
  cast = 'cast', // Búsqueda por actores/actrices
}

/**
 * Interfaz para todos los proveedores de búsqueda.
 *
 * Define la estructura común que deben implementar todos los
 * servicios de búsqueda de películas (FilmAffinity, IMDb, etc.)
 */
export interface Provider {
  /**
   * Devuelve el identificador único del proveedor
   */
  getId(): string

  /**
   * Devuelve el nombre de visualización del proveedor.
   */
  getName(): string

  /**
   * Construye la URL de búsqueda específica para el proveedor.
   *
   * @param search Texto a buscar
   * @param type Tipo de búsqueda (título, director, etc.)
   */
  makeUrl(search: string, type: SearchType): string

  /**
   * Crea un elemento de enlace HTML que dirige a la búsqueda.
   *
   * @param url URL de destino
   * @param extraClasses Clases CSS adicionales para el botón
   */
  makeButton(url: string, extraClasses?: string[]): HTMLAnchorElement
}

/**
 * Clase base abstracta que implementa funcionalidad común
 * para todos los proveedores de búsqueda.
 */
export abstract class AbstractProvider implements Provider {
  abstract getId(): string
  abstract getName(): string
  abstract makeUrl(search: string, type: SearchType): string

  /**
   * Implementación por defecto para crear botones de enlace
   *
   * Crea elementos de enlace HTML con:
   * - El nombre del proveedor como texto
   * - Clases CSS específicas del proveedor
   * - Apertura en nueva pestaña
   * - Prevención de propagación de eventos (útil en enlaces anidados)
   */
  makeButton(url: string, extraClasses: string[] = []): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a')
    const icon: HTMLSpanElement = document.createElement('span')
    icon.textContent = this.getName()
    link.appendChild(icon)
    link.href = url
    link.target = '_blank'
    link.classList.add('filminlinks-button', `${this.getId()}-button`, ...extraClasses)
    link.addEventListener('click', (event): void => event.stopPropagation())
    return link
  }
}
