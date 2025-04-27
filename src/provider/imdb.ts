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
 * Proveedor de búsquedas para IMDb.
 */
export default class ImdbProvider extends AbstractProvider implements Provider {
  static getId(): string {
    return 'imdb'
  }

  static getName(): string {
    return 'IMDb'
  }

  static getIcon(): string {
    return `${ImdbProvider.getId()}.svg`
  }

  getId(): string {
    return ImdbProvider.getId()
  }

  getName(): string {
    return ImdbProvider.getName()
  }

  getIcon(): string {
    return ImdbProvider.getIcon()
  }

  makeUrl(search: string, type: SearchType = SearchType.all): string {
    switch (type) {
      case SearchType.title:
        return `https://www.imdb.com/find/?s=tt&q=${encodeURIComponent(search)}`
      case SearchType.cast:
      case SearchType.director:
        return `https://www.imdb.com/find/?s=nm&q=${encodeURIComponent(search)}`
      case SearchType.all:
        return `https://www.imdb.com/find/?q=${encodeURIComponent(search)}`
    }
  }
}
