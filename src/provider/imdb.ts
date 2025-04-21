import { AbstractProvider, Provider, SearchType } from './provider'

export default class ImdbProvider extends AbstractProvider implements Provider {
  static getId(): string {
    return 'imdb'
  }

  static getName(): string {
    return 'IMDb'
  }

  getId(): string {
    return ImdbProvider.getId()
  }

  getName(): string {
    return ImdbProvider.getName()
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
