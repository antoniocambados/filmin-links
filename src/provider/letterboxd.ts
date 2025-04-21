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

  getId(): string {
    return LetterboxdProvider.getId()
  }

  getName(): string {
    return LetterboxdProvider.getName()
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
