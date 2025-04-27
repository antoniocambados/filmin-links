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
 * Proveedor de búsquedas para Letterboxd.
 */
export default class LetterboxdProvider extends AbstractProvider implements Provider {
  static getId(): string {
    return 'letterboxd'
  }

  static getName(): string {
    return 'Letterboxd'
  }

  static getIcon(): string {
    return `${LetterboxdProvider.getId()}.svg`
  }

  getId(): string {
    return LetterboxdProvider.getId()
  }

  getName(): string {
    return LetterboxdProvider.getName()
  }

  getIcon(): string {
    return LetterboxdProvider.getIcon()
  }

  makeUrl(search: string, type: SearchType = SearchType.all): string {
    switch (type) {
      case SearchType.title:
        return `https://letterboxd.com/search/films/${encodeURIComponent(search)}/`
      case SearchType.cast:
        return `https://letterboxd.com/actor/${this.slugify(search)}/`
      case SearchType.director:
        return `https://letterboxd.com/director/${this.slugify(search)}/`
      case SearchType.all:
        return `https://letterboxd.com/search/${encodeURIComponent(search)}/`
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Normaliza caracteres Unicode
      .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos
      .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
      .replace(/\s+/g, '-') // Reemplaza espacios con guiones
      .replace(/-+/g, '-') // Evita múltiples guiones seguidos
      .replace(/^-+|-+$/g, '') // Elimina guiones al inicio y final
  }
}
