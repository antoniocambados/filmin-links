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
 * Proveedor de búsquedas para Filmaffinity.
 */
export default class FilmaffinityProvider extends AbstractProvider implements Provider {
  static getId(): string {
    return 'filmaffinity'
  }

  static getName(): string {
    return 'FilmAffinity'
  }

  static getIcon(): string {
    return `${FilmaffinityProvider.getId()}.png`
  }

  getId(): string {
    return FilmaffinityProvider.getId()
  }

  getName(): string {
    return FilmaffinityProvider.getName()
  }

  getIcon(): string {
    return FilmaffinityProvider.getIcon()
  }

  makeUrl(search: string, type: SearchType = SearchType.all): string {
    switch (type) {
      case SearchType.title:
        return `https://www.filmaffinity.com/es/search.php?stype=title&stext=${encodeURIComponent(search)}`
      case SearchType.cast:
        return `https://www.filmaffinity.com/es/search.php?stype=cast&stext=${encodeURIComponent(search)}`
      case SearchType.director:
        return `https://www.filmaffinity.com/es/search.php?stype=name&stext=${encodeURIComponent(search)}`
      case SearchType.all:
        return `https://www.filmaffinity.com/es/search.php?stext=${encodeURIComponent(search)}`
    }
  }
}
