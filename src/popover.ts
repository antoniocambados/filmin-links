import tippy from 'tippy.js'
import manager, { AVAILABLE_PROVIDERS, Provider, ProviderManager, SearchType } from './provider/provider'

const providerManager: ProviderManager = manager

export interface PopoverElement extends HTMLElement {
  filminlinksPopover?: Popover | undefined
}

export class Popover {
  private readonly element: HTMLElement
  private readonly searchTerm: string
  private readonly searchType: SearchType
  private readonly popoverClasses: string[] = []
  private popover: any

  constructor(element: HTMLElement, searchTerm: string, searchType: SearchType, popoverClasses: string[] = []) {
    this.element = element
    this.searchTerm = searchTerm.trim()
    this.searchType = searchType
    this.popoverClasses = popoverClasses

    this.#make()
  }

  destroy(): void {
    this.popover.destroy()
    this.popover = undefined
  }

  rebuild(): void {
    this.destroy()
    this.#make()
  }

  #make(): void {
    const popover: HTMLElement = document.createElement('div')
    popover.classList.add('filminlinks-popover', ...this.popoverClasses)
    const header: HTMLElement = this.#makeHeader()
    const footer: HTMLElement = this.#makeFooter()

    this.#makeToolbar().then((toolbar) => {
      popover.appendChild(header)
      popover.appendChild(toolbar)
      popover.appendChild(footer)

      this.popover = tippy(this.element, {
        appendTo: () => document.body,
        content: popover,
        allowHTML: true,
        interactive: true,
        theme: 'filminlinks',
        arrow: false,
        // trigger: 'click',
      })
    })
  }

  #makeHeader(): HTMLElement {
    const row: HTMLElement = this.#makeRow()

    row.appendChild(this.#makeLogo())
    row.appendChild(this.#makeTitle())

    return row
  }

  #makeFooter(): HTMLElement {
    const row: HTMLElement = this.#makeRow()

    row.appendChild(this.#makeSettings())

    return row
  }

  #makeTitle(): HTMLElement {
    const title: HTMLElement = document.createElement('div')
    title.innerHTML = `<p class="filminlinks-popover-title">Buscar...<br><span class="filminlinks-popover-term">${this.searchTerm}</span></p>`

    return title.firstElementChild as HTMLElement
  }

  #makeLogo(): HTMLElement {
    const imgUrl = chrome.runtime.getURL('icons/full.svg')
    const img = document.createElement('img')

    img.src = imgUrl
    img.alt = 'FilminLinks'
    img.classList.add('filminlinks-logo')

    return img
  }

  #makeSettings(): HTMLElement {
    const button: HTMLElement = document.createElement('a')
    button.setAttribute('href', '#')
    button.classList.add('filminlinks-settings-button')
    button.textContent = 'Configurar FilminLinks'

    button.addEventListener('click', (event) => {
      event.preventDefault()
      chrome.runtime.sendMessage({ action: 'openOptions' })
    })

    return button
  }

  async #makeToolbar(): Promise<HTMLElement> {
    const row: HTMLElement = this.#makeRow()
    row.classList.add('filminlinks-popover-row-center')

    const providerNames = await this.#getEnabledProviders()
    const providers = providerManager.get(providerNames)
    providers.forEach((provider: Provider) => {
      row.appendChild(provider.makeButton(provider.makeUrl(this.searchTerm, this.searchType)))
    })

    return row
  }

  #makeRow(): HTMLElement {
    let row: HTMLElement = document.createElement('div')
    row.classList.add('filminlinks-popover-row')

    return row
  }

  async #getEnabledProviders(): Promise<string[]> {
    const items = await chrome.storage.sync.get({ enabledProviders: AVAILABLE_PROVIDERS })
    return items.enabledProviders
  }
}
