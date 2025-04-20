import manager, { AVAILABLE_PROVIDERS, Provider, ProviderManager, SearchType } from '../provider/provider'
import PopoverManager from './PopoverManager'

const providerManager: ProviderManager = manager

export interface PopoverElement extends HTMLElement {
  filminlinksPopover?: Popover | undefined
}

export class Popover {
  private readonly searchTerm: string
  private readonly searchType: SearchType
  private readonly popoverClasses: string[] = []
  private readonly trigger: HTMLElement
  private readonly popoverManager: PopoverManager
  private popoverContent: HTMLElement

  constructor(trigger: HTMLElement, searchTerm: string, searchType: SearchType, popoverClasses: string[] = []) {
    this.trigger = trigger
    this.searchTerm = searchTerm.trim()
    this.searchType = searchType
    this.popoverClasses = popoverClasses

    // Marcar el trigger para identificación futura
    this.trigger.classList.add('filminlinks-trigger')

    // Obtener instancia del gestor de popovers
    this.popoverManager = PopoverManager.getInstance()

    // Crear el contenido del popover
    this.popoverContent = this.createPopoverContent()

    // Inicializar eventos
    this.initEvents()
  }

  private initEvents(): void {
    // Eventos del trigger
    this.trigger.addEventListener('mouseenter', () => {
      this.popoverManager.showPopover(this.trigger, this.popoverContent)
    })

    this.trigger.addEventListener('mouseleave', (event) => {
      // El gestor central se encarga de decidir si ocultar o no
      this.popoverManager['handleLeave'](event)
    })
  }

  // Método para reconstruir el popover (útil si cambias algo en la configuración)
  rebuild(): void {
    this.popoverContent = this.createPopoverContent()
  }

  private createPopoverContent(): HTMLElement {
    const popover: HTMLElement = document.createElement('div')
    popover.classList.add('filminlinks-popover', ...this.popoverClasses)

    const header: HTMLElement = this.makeHeader()
    const footer: HTMLElement = this.makeFooter()

    const toolbar = document.createElement('div')
    toolbar.classList.add('filminlinks-popover-row', 'filminlinks-popover-row-center')

    popover.appendChild(header)
    popover.appendChild(toolbar)
    popover.appendChild(footer)

    // Cargar el toolbar de forma asíncrona sin bloquear la visualización
    this.makeToolbar().then((realToolbar) => {
      toolbar.innerHTML = ''

      // Copiar los hijos del toolbar real al placeholder
      Array.from(realToolbar.children).forEach((child) => {
        toolbar.appendChild(child)
      })
    })

    return popover
  }

  private makeHeader(): HTMLElement {
    const row: HTMLElement = this.makeRow()

    row.appendChild(this.makeLogo())
    row.appendChild(this.makeTitle())

    return row
  }

  private makeFooter(): HTMLElement {
    const row: HTMLElement = this.makeRow()

    row.appendChild(this.makeSettings())

    return row
  }

  private makeTitle(): HTMLElement {
    const title: HTMLElement = document.createElement('div')
    title.innerHTML = `<p class="filminlinks-popover-title">Buscar...<br><span class="filminlinks-popover-term">${this.searchTerm}</span></p>`

    return title.firstElementChild as HTMLElement
  }

  private makeLogo(): HTMLElement {
    const imgUrl = chrome.runtime.getURL('icons/full.svg')
    const img = document.createElement('img')

    img.src = imgUrl
    img.alt = 'FilminLinks'
    img.classList.add('filminlinks-logo')

    return img
  }

  private makeSettings(): HTMLElement {
    const button: HTMLElement = document.createElement('a')
    button.setAttribute('href', '#')
    button.classList.add('filminlinks-settings-button')
    button.textContent = 'Configurar FilminLinks'

    button.addEventListener('click', (event) => {
      event.preventDefault()

      try {
        chrome.runtime.sendMessage({ action: 'openOptions' }).catch((error) => {
          console.error('Error al enviar mensaje:', error)
          // Plan alternativo: abrir opciones directamente si el mensaje falla
          chrome.runtime.openOptionsPage()
        })
      } catch (e) {
        console.error('Error al intentar enviar mensaje:', e)
        // Plan alternativo si la API de mensajes falla por completo
        chrome.runtime.openOptionsPage()
      }
    })

    return button
  }

  private async makeToolbar(): Promise<HTMLElement> {
    const row: HTMLElement = this.makeRow()
    row.classList.add('filminlinks-popover-row-center')

    const providerNames = await this.getEnabledProviders()
    const providers = providerManager.get(providerNames)
    providers.forEach((provider: Provider) => {
      row.appendChild(provider.makeButton(provider.makeUrl(this.searchTerm, this.searchType)))
    })

    return row
  }

  private makeRow(): HTMLElement {
    let row: HTMLElement = document.createElement('div')
    row.classList.add('filminlinks-popover-row')

    return row
  }

  private async getEnabledProviders(): Promise<string[]> {
    const items = await chrome.storage.sync.get({ enabledProviders: AVAILABLE_PROVIDERS })
    return items.enabledProviders
  }
}
