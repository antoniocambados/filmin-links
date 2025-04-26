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
