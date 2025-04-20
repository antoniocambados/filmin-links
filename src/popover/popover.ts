import manager, { AVAILABLE_PROVIDERS, Provider, ProviderManager, SearchType } from '../provider/provider'

const providerManager: ProviderManager = manager

// Gestor centralizado de popovers
class PopoverManager {
  private static instance: PopoverManager
  private popoverEl: HTMLElement
  private currentTrigger: HTMLElement | null = null
  private hideTimeoutId: number | null = null
  private connectionArea: HTMLElement | null = null
  private content: HTMLElement | null = null

  private constructor() {
    // Crear el contenedor del popover
    this.popoverEl = document.createElement('div')
    this.popoverEl.classList.add('filminlinks-popover-container')
    this.popoverEl.style.position = 'absolute'
    document.body.appendChild(this.popoverEl)

    // Crear el área de conexión
    this.connectionArea = document.createElement('div')
    this.connectionArea.classList.add('filminlinks-connection-area')
    this.connectionArea.style.position = 'absolute'
    this.connectionArea.style.background = 'transparent'
    this.connectionArea.style.pointerEvents = 'auto'
    this.connectionArea.style.display = 'none'
    document.body.appendChild(this.connectionArea)

    // Inicializar eventos
    this.popoverEl.addEventListener('mouseenter', () => this.cancelHideTimeout())
    this.popoverEl.addEventListener('mouseleave', (event) => this.handleLeave(event))
    this.connectionArea.addEventListener('mouseenter', () => this.cancelHideTimeout())
    this.connectionArea.addEventListener('mouseleave', (event) => this.handleLeave(event))
  }

  public static getInstance(): PopoverManager {
    if (!PopoverManager.instance) {
      PopoverManager.instance = new PopoverManager()
    }
    return PopoverManager.instance
  }

  public showPopover(trigger: HTMLElement, content: HTMLElement): void {
    // Cancelar cualquier timeout previo
    this.cancelHideTimeout()

    // Actualizar el trigger actual
    this.currentTrigger = trigger

    // Actualizar el contenido si es diferente
    if (this.content !== content) {
      this.content = content
      this.popoverEl.innerHTML = ''
      this.popoverEl.appendChild(content)
    }

    // Posicionar el popover
    this.position()

    // Mostrar el popover
    this.popoverEl.classList.add('visible')
    if (this.connectionArea) {
      this.connectionArea.style.display = 'block'
    }
  }

  private position(): void {
    if (!this.currentTrigger) return

    const rect = this.currentTrigger.getBoundingClientRect()
    this.popoverEl.style.top = `${rect.bottom + window.scrollY + 5}px`
    this.popoverEl.style.left = `${rect.left + window.scrollX}px`

    // Actualizar el área de conexión
    if (this.connectionArea) {
      this.connectionArea.style.top = `${rect.bottom + window.scrollY}px`
      this.connectionArea.style.left = `${rect.left + window.scrollX}px`
      this.connectionArea.style.width = `${rect.width}px`
      this.connectionArea.style.height = `${5}px`
      this.connectionArea.style.zIndex = '9998'
    }
  }

  private handleLeave(event: MouseEvent): void {
    // Verificar si el cursor se mueve a otro elemento controlado
    const relatedTarget = event.relatedTarget as HTMLElement

    // Si el cursor se mueve al popover, al área de conexión, o a un trigger, no ocultar
    if (
      relatedTarget &&
      (this.popoverEl.contains(relatedTarget) ||
        (this.connectionArea && this.connectionArea.contains(relatedTarget)) ||
        this.isMovingToAnotherTrigger(relatedTarget))
    ) {
      this.cancelHideTimeout()
      return
    }

    this.scheduleHide()
  }

  private isMovingToAnotherTrigger(element: HTMLElement): boolean {
    // Comprobar si el elemento tiene un popover asociado
    return element.classList.contains('filminlinks-trigger')
  }

  private cancelHideTimeout(): void {
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId)
      this.hideTimeoutId = null
    }
  }

  private scheduleHide(): void {
    this.cancelHideTimeout()
    this.hideTimeoutId = window.setTimeout(() => {
      this.popoverEl.classList.remove('visible')
      if (this.connectionArea) {
        this.connectionArea.style.display = 'none'
      }
      this.hideTimeoutId = null
    }, 300)
  }
}

export interface PopoverElement extends HTMLElement {
  filminlinksPopover?: Popover | undefined
}

export class Popover {
  private readonly searchTerm: string
  private readonly searchType: SearchType
  private readonly popoverClasses: string[] = []
  private trigger: HTMLElement
  private popoverContent: HTMLElement
  private popoverManager: PopoverManager

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
      chrome.runtime.sendMessage({ action: 'openOptions' })
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
