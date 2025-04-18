import { Provider, SearchType } from './provider'

export default class ImdbProvider implements Provider {
  name: string = 'IMDb'

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

  makeButton(url: string, extraClasses: string[] = []): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a')
    const icon: HTMLSpanElement = document.createElement('span')
    icon.textContent = 'IMDb'
    link.appendChild(icon)
    link.href = url
    link.target = '_blank'
    link.classList.add('filminlinks-button', 'imdb-button', ...extraClasses)
    // Evita la propagación del evento click si el enlace está dentro de otro enlace.
    link.addEventListener('click', (event): void => event.stopPropagation())
    return link
  }
}
