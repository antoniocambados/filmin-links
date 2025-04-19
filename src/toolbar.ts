import tippy from 'tippy.js'
import manager, { AVAILABLE_PROVIDERS, Provider, ProviderManager, SearchType } from './provider/provider'

const providerManager: ProviderManager = manager

export interface ToolbarElement extends HTMLElement {
  toolbar?: Toolbar | undefined
}

export class Toolbar {
  private readonly element: HTMLElement
  private readonly searchTerm: string
  private readonly searchType: SearchType
  private readonly toolbarClasses: string[] = []
  private toolbar: any

  constructor(element: HTMLElement, searchTerm: string, searchType: SearchType, toolbarClasses: string[] = []) {
    this.element = element
    this.searchTerm = searchTerm.trim()
    this.searchType = searchType
    this.toolbarClasses = toolbarClasses

    this.#make()
  }

  destroy(): void {
    this.toolbar.destroy()
    this.toolbar = undefined
  }

  rebuild(): void {
    this.destroy()
    this.#make()
  }

  #make(): void {
    const toolbar: HTMLElement = document.createElement('div')
    toolbar.classList.add('filminlinks-toolbar', ...this.toolbarClasses)
    const header: HTMLElement = this.#makeHeader()
    const footer: HTMLElement = this.#makeFooter()

    this.#makeButtons().then((buttons) => {
      toolbar.appendChild(header)
      toolbar.appendChild(buttons)
      toolbar.appendChild(footer)

      this.toolbar = tippy(this.element, {
        appendTo: () => document.body,
        content: toolbar,
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
    title.innerHTML = `<p class="filminlinks-toolbar-title">Buscar...<br><span class="filminlinks-toolbar-term">${this.searchTerm}</span></p>`

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

  async #makeButtons(): Promise<HTMLElement> {
    const row: HTMLElement = this.#makeRow()
    row.classList.add('filminlinks-toolbar-row-center')

    const providerNames = await this.#getEnabledProviders()
    const providers = providerManager.get(providerNames)
    providers.forEach((provider: Provider) => {
      row.appendChild(provider.makeButton(provider.makeUrl(this.searchTerm, this.searchType)))
    })

    return row
  }

  #makeRow(): HTMLElement {
    let row: HTMLElement = document.createElement('div')
    row.classList.add('filminlinks-toolbar-row')

    return row
  }

  async #getEnabledProviders(): Promise<string[]> {
    const items = await chrome.storage.sync.get({ enabledProviders: AVAILABLE_PROVIDERS })
    return items.enabledProviders
  }
}
