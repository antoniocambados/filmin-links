export enum SearchType {
  all = 'all',
  title = 'title',
  director = 'director',
  cast = 'cast',
}

export interface Provider {
  getId(): string
  getName(): string
  makeUrl(search: string, type: SearchType): string
  makeButton(url: string, extraClasses?: string[]): HTMLAnchorElement
}

export abstract class AbstractProvider implements Provider {
  abstract getId(): string
  abstract getName(): string
  abstract makeUrl(search: string, type: SearchType): string

  makeButton(url: string, extraClasses: string[] = []): HTMLAnchorElement {
    const link: HTMLAnchorElement = document.createElement('a')
    const icon: HTMLSpanElement = document.createElement('span')
    icon.textContent = this.getName()
    link.appendChild(icon)
    link.href = url
    link.target = '_blank'
    link.classList.add('filminlinks-button', `${this.getId()}-button`, ...extraClasses)
    link.addEventListener('click', (event): void => event.stopPropagation())
    return link
  }
}
