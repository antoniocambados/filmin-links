import { Provider, SearchType } from './provider'

export default class FilmaffinityProvider implements Provider {
  name: string = 'FilmAffinity'

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

  makeButton(url: string, extraClasses: string[] = []): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a')
    const icon: HTMLSpanElement = document.createElement('span')
    icon.textContent = 'FilmAffinity'
    link.appendChild(icon)
    link.href = url
    link.target = '_blank'
    link.classList.add('filminlinks-button', 'fa-button', ...extraClasses)
    // Evita la propagación del evento click si el enlace está dentro de otro enlace.
    link.addEventListener('click', (event): void => event.stopPropagation())
    return link
  }
}
