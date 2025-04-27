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

import { AbstractProvider, Provider, SearchType } from './provider'

/**
 * Proveedor de búsquedas para Rotten Tomatoes.
 */
export default class RottenTomatoesProvider extends AbstractProvider implements Provider {
  static getId(): string {
    return 'rottentomatoes'
  }

  static getName(): string {
    return 'Rotten Tomatoes'
  }

  static getIcon(): string {
    return `${RottenTomatoesProvider.getId()}.svg`
  }

  getId(): string {
    return RottenTomatoesProvider.getId()
  }

  getName(): string {
    return RottenTomatoesProvider.getName()
  }

  getIcon(): string {
    return RottenTomatoesProvider.getIcon()
  }

  makeUrl(search: string, type: SearchType = SearchType.all): string {
    return `https://www.rottentomatoes.com/search?search=${encodeURIComponent(search)}`
  }
}
