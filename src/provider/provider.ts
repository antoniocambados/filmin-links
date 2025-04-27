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
   * Devuelve el nombre del icono.
   */
  getIcon(): string

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
  abstract getIcon(): string
  abstract makeUrl(search: string, type: SearchType): string

  /**
   * Implementación por defecto para crear botones de enlace
   *
   * Crea elementos de enlace HTML con:
   * - Un icono SVG basado en el ID del proveedor
   * - El nombre del proveedor como texto
   * - Clases CSS específicas del proveedor
   * - Apertura en nueva pestaña
   * - Prevención de propagación de eventos (útil en enlaces anidados)
   */
  makeButton(url: string, extraClasses: string[] = []): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a')

    // Crear el icono SVG
    const icon: HTMLImageElement = document.createElement('img')
    icon.src = chrome.runtime.getURL(`icons/provider/${this.getIcon()}`)
    icon.alt = `${this.getName()} icon`
    icon.classList.add('filminlinks-button-icon')

    // Crear el elemento de texto
    const name: HTMLSpanElement = document.createElement('span')
    name.textContent = this.getName()

    // Añadir icono y texto al enlace
    link.appendChild(icon)
    link.appendChild(name)

    // Configurar propiedades del enlace
    link.href = url
    link.title = `Buscar en ${this.getName()}`
    link.target = '_blank'
    link.classList.add('filminlinks-button', `${this.getId()}-button`, ...extraClasses)
    link.addEventListener('click', (event): void => event.stopPropagation())

    return link
  }
}
