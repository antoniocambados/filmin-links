import { Provider } from './provider'
import FilmaffinityProvider from './filmaffinity'
import ImdbProvider from './imdb'
import LetterboxdProvider from './letterboxd'

export const AVAILABLE_PROVIDERS: string[] = [
  FilmaffinityProvider.getId(),
  ImdbProvider.getId(),
  LetterboxdProvider.getId(),
]

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
