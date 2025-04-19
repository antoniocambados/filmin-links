import FilmaffinityProvider from './filmaffinity'
import ImdbProvider from './imdb'
import LetterboxdProvider from './letterboxd'

export enum SearchType {
  all = 'all',
  title = 'title',
  director = 'director',
  cast = 'cast',
}

export const AVAILABLE_PROVIDERS: string[] = [
  FilmaffinityProvider.getId(),
  ImdbProvider.getId(),
  LetterboxdProvider.getId(),
]

export interface Provider {
  /**
   * Obtiene un identificador único para el proveedor.
   *
   * @return {string} El identificador.
   */
  getId(): string

  /**
   * Obtiene un nombre para el proveedor.
   *
   * Por ejemplo, "FilmAffinity" o "IMDB" o "Letterboxd"
   *
   * @return {string} El nombre.
   */
  getName(): string

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
    this.providers[provider.getId()] = provider
  }

  remove(id: string): void {
    delete this.providers[id]
  }

  get(selectedProviders: string[]): Provider[] {
    let providers: Provider[] = []

    selectedProviders.forEach((providerId: string): void => {
      if (this.providers[providerId]) {
        providers.push(this.providers[providerId])
      }
    })

    return providers
  }

  all(): Provider[] {
    return Object.values(this.providers)
  }

  reset(): void {
    this.providers = {}
  }
}

const manager = new ProviderManager()

manager.add(new FilmaffinityProvider())
manager.add(new ImdbProvider())
manager.add(new LetterboxdProvider())

export default manager
