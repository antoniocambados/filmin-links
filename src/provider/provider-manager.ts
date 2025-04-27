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

import { Provider } from './provider'
import FilmaffinityProvider from './filmaffinity'
import ImdbProvider from './imdb'
import LetterboxdProvider from './letterboxd'
import RottenTomatoesProvider from './rottentomatoes'

/**
 * Lista de identificadores de todos los proveedores disponibles en la aplicación.
 */
export const AVAILABLE_PROVIDERS: string[] = [
  FilmaffinityProvider.getId(),
  ImdbProvider.getId(),
  LetterboxdProvider.getId(),
  RottenTomatoesProvider.getId(),
]

/**
 * Clase para gestionar los proveedores de búsqueda de películas.
 *
 * Proporciona métodos para añadir, eliminar y obtener proveedores,
 * facilitando la gestión centralizada de todos los servicios de búsqueda.
 */
export class ProviderManager {
  /** Almacén de proveedores indexados por su identificador */
  private providers: Record<string, Provider> = {}

  /**
   * Añade un nuevo proveedor al gestor.
   *
   * @param provider Instancia del proveedor a añadir
   */
  add(provider: Provider): void {
    this.providers[provider.getId()] = provider
  }

  /**
   * Elimina un proveedor del gestor.
   *
   * @param id Identificador único del proveedor a eliminar
   */
  remove(id: string): void {
    delete this.providers[id]
  }

  /**
   * Obtiene los proveedores seleccionados según una lista de identificadores.
   *
   * Este método filtra los proveedores disponibles y devuelve solo
   * aquellos cuyos identificadores están en la lista proporcionada.
   *
   * @param selectedProviders Lista de identificadores de proveedores a obtener
   * @returns Array con las instancias de los proveedores solicitados
   */
  get(selectedProviders: string[]): Provider[] {
    let providers: Provider[] = []

    selectedProviders.forEach((providerId: string): void => {
      if (this.providers[providerId]) {
        providers.push(this.providers[providerId])
      }
    })

    return providers
  }

  /**
   * Obtiene todos los proveedores disponibles.
   *
   * @returns Array con todas las instancias de proveedores registrados
   */
  all(): Provider[] {
    return Object.values(this.providers)
  }

  /**
   * Elimina todos los proveedores del gestor.
   */
  reset(): void {
    this.providers = {}
  }
}

/**
 * Instancia global del gestor de proveedores.
 *
 * Se inicializa con los proveedores predeterminados de la aplicación:
 * Filmaffinity, IMDB y Letterboxd.
 */
const manager = new ProviderManager()

manager.add(new FilmaffinityProvider())
manager.add(new ImdbProvider())
manager.add(new LetterboxdProvider())
manager.add(new RottenTomatoesProvider())

export default manager
