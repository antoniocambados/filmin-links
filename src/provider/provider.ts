import FilmaffinityProvider from './filmaffinity'
import ImdbProvider from './imdb'
import LetterboxdProvider from './letterboxd'

export enum SearchType {
  all = 'all',
  title = 'title',
  director = 'director',
  cast = 'cast',
}

export interface Provider {
  name: string

  /**
   * Construye la URL de búsqueda en Filmaffinity.
   *
   * @param search Texto de la búsqueda
   * @param type Tipo de búsqueda
   */
  makeUrl(search: string, type: SearchType): string

  /**
   * Crea un botón de enlace a la URL con las clases especificadas.
   *
   * @param url URL del enlace
   * @param extraClasses Clases adicionales
   */
  makeButton(url: string, extraClasses?: string[]): HTMLAnchorElement
}

export class ProviderManager {
  private providers: Record<string, Provider> = {}

  add(provider: Provider): void {
    this.providers[provider.name] = provider
  }

  remove(name: string): void {
    delete this.providers[name]
  }

  get(selectedProviders: string[]): Provider[] {
    let providers: Provider[] = []

    selectedProviders.forEach((providerName: string): void => {
      if (this.providers[providerName]) {
        providers.push(this.providers[providerName])
      }
    })

    return providers
  }

  all(): Provider[] {
    return Object.values(this.providers)
  }
}

const manager = new ProviderManager()

manager.add(new FilmaffinityProvider())
manager.add(new ImdbProvider())
manager.add(new LetterboxdProvider())

export default manager
