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
