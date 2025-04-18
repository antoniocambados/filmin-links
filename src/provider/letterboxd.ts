import { Provider, SearchType } from './provider'

export default class LetterboxdProvider implements Provider {
  name: string = 'Letterboxd'

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

  makeButton(url: string, extraClasses: string[] = []): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a')
    const icon: HTMLSpanElement = document.createElement('span')
    icon.textContent = 'Letterboxd'
    link.appendChild(icon)
    link.href = url
    link.target = '_blank'
    link.classList.add('filminlinks-button', 'letterboxd-button', ...extraClasses)
    // Evita la propagación del evento click si el enlace está dentro de otro enlace.
    link.addEventListener('click', (event): void => event.stopPropagation())
    return link
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
