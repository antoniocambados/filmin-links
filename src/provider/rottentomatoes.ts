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
