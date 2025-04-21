export enum PopoverPosition {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export default class PopoverManager {
  private static instance: PopoverManager
  private readonly popoverEl: HTMLElement
  private currentTrigger: HTMLElement | null = null
  private hideTimeoutId: number | null = null
  private readonly connectionArea: HTMLElement | null = null
  private content: HTMLElement | null = null
  private preferredPosition: PopoverPosition = PopoverPosition.TOP
  // Propiedad para almacenar en caché el ancho de la barra de desplazamiento
  private cachedScrollbarWidth: number = 0

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

    // Calcular el ancho de la barra de desplazamiento al inicio
    this.cachedScrollbarWidth = this.getScrollbarWidth()

    // Cargar la posición preferida del usuario
    this.loadPreferredPosition()

    // Inicializar eventos
    this.popoverEl.addEventListener('mouseenter', () => this.cancelHideTimeout())
    this.popoverEl.addEventListener('mouseleave', (event) => this.handleLeave(event))
    this.connectionArea.addEventListener('mouseenter', () => this.cancelHideTimeout())
    this.connectionArea.addEventListener('mouseleave', (event) => this.handleLeave(event))

    // Añadir listener de redimensionamiento de ventana
    window.addEventListener('resize', () => {
      // Recalcular el ancho de la barra de desplazamiento
      this.cachedScrollbarWidth = this.getScrollbarWidth()

      if (this.popoverEl.classList.contains('visible') && this.currentTrigger) {
        this.position()
      }
    })

    // Añadir listener de scroll
    window.addEventListener(
      'scroll',
      () => {
        if (this.popoverEl.classList.contains('visible') && this.currentTrigger) {
          this.position()
        }
      },
      { passive: true },
    )

    // Escuchar cambios en la configuración
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.popoverPosition) {
        this.preferredPosition = changes.popoverPosition.newValue as PopoverPosition
      }
    })
  }

  private loadPreferredPosition(): void {
    chrome.storage.sync.get({ popoverPosition: PopoverPosition.TOP }, (result) => {
      this.preferredPosition = result.popoverPosition as PopoverPosition
    })
  }

  public static getInstance(): PopoverManager {
    if (!PopoverManager.instance) {
      PopoverManager.instance = new PopoverManager()
    }
    return PopoverManager.instance
  }

  public setPreferredPosition(position: PopoverPosition): void {
    this.preferredPosition = position
  }

  public getPreferredPosition(): PopoverPosition {
    return this.preferredPosition
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

    // Primero hacer visible el popover para poder medir su tamaño
    this.popoverEl.classList.add('visible')
    if (this.connectionArea) {
      this.connectionArea.style.display = 'block'
    }

    // Posicionar el popover después de hacerlo visible
    this.position()
  }

  private position(): void {
    if (!this.currentTrigger) return

    const triggerRect = this.currentTrigger.getBoundingClientRect()
    const popoverRect = this.popoverEl.getBoundingClientRect()
    // Usar clientWidth en lugar de innerWidth para excluir la barra de desplazamiento
    const viewportWidth = document.documentElement.clientWidth
    const viewportHeight = window.innerHeight

    // Resetear clases de posición
    this.popoverEl.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right')

    // Determinar la mejor posición
    const bestPosition = this.calculateBestPosition(triggerRect, popoverRect, viewportWidth, viewportHeight)

    // Aplicar la posición
    switch (bestPosition) {
      case PopoverPosition.TOP:
        this.positionTop(triggerRect, popoverRect)
        break
      case PopoverPosition.BOTTOM:
        this.positionBottom(triggerRect, popoverRect)
        break
      case PopoverPosition.LEFT:
        this.positionLeft(triggerRect, popoverRect)
        break
      case PopoverPosition.RIGHT:
        this.positionRight(triggerRect, popoverRect)
        break
    }

    // Ajustar posición horizontal si se sale del viewport
    this.adjustHorizontalPosition(popoverRect, viewportWidth)

    // Ajustar posición vertical si se sale del viewport
    this.adjustVerticalPosition(popoverRect, viewportHeight)

    // Actualizar el área de conexión
    this.updateConnectionArea(triggerRect, bestPosition)
  }

  private calculateBestPosition(
    triggerRect: DOMRect,
    popoverRect: DOMRect,
    viewportWidth: number,
    viewportHeight: number,
  ): PopoverPosition {
    // Espacio disponible en cada dirección
    const spaceTop = triggerRect.top
    const spaceBottom = viewportHeight - triggerRect.bottom
    const spaceLeft = triggerRect.left
    const spaceRight = viewportWidth - triggerRect.right

    // Márgenes de seguridad
    const margin = 20

    // Comprobar si cabe en cada dirección con margen
    const fitsTop = popoverRect.height + margin <= spaceTop
    const fitsBottom = popoverRect.height + margin <= spaceBottom
    const fitsLeft = popoverRect.width + margin <= spaceLeft
    const fitsRight = popoverRect.width + margin <= spaceRight

    // Intentar usar la posición preferida si es posible
    if (this.preferredPosition === PopoverPosition.BOTTOM && fitsBottom) {
      return PopoverPosition.BOTTOM
    } else if (this.preferredPosition === PopoverPosition.TOP && fitsTop) {
      return PopoverPosition.TOP
    } else if (this.preferredPosition === PopoverPosition.LEFT && fitsLeft) {
      return PopoverPosition.LEFT
    } else if (this.preferredPosition === PopoverPosition.RIGHT && fitsRight) {
      return PopoverPosition.RIGHT
    }

    // Si la preferida no funciona, elegir la mejor opción
    const spaces = [
      { pos: PopoverPosition.BOTTOM, space: spaceBottom, fits: fitsBottom },
      { pos: PopoverPosition.TOP, space: spaceTop, fits: fitsTop },
      { pos: PopoverPosition.RIGHT, space: spaceRight, fits: fitsRight },
      { pos: PopoverPosition.LEFT, space: spaceLeft, fits: fitsLeft },
    ]

    // Primero intentar con las que caben
    const fittingPositions = spaces.filter((s) => s.fits)
    if (fittingPositions.length > 0) {
      // Ordenar por espacio disponible (mayor a menor)
      fittingPositions.sort((a, b) => b.space - a.space)
      return fittingPositions[0].pos
    }

    // Si ninguna cabe perfectamente, elegir la que tenga más espacio
    spaces.sort((a, b) => b.space - a.space)
    return spaces[0].pos
  }

  private positionTop(triggerRect: DOMRect, popoverRect: DOMRect): void {
    const left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2
    const top = triggerRect.top - popoverRect.height - 5

    this.popoverEl.style.top = `${top + window.scrollY}px`
    this.popoverEl.style.left = `${left + window.scrollX}px`
    this.popoverEl.classList.add('position-top')
  }

  private positionBottom(triggerRect: DOMRect, popoverRect: DOMRect): void {
    const left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2
    const top = triggerRect.bottom + 5

    this.popoverEl.style.top = `${top + window.scrollY}px`
    this.popoverEl.style.left = `${left + window.scrollX}px`
    this.popoverEl.classList.add('position-bottom')
  }

  private positionLeft(triggerRect: DOMRect, popoverRect: DOMRect): void {
    const left = triggerRect.left - popoverRect.width - 5
    const top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2

    this.popoverEl.style.top = `${top + window.scrollY}px`
    this.popoverEl.style.left = `${left + window.scrollX}px`
    this.popoverEl.classList.add('position-left')
  }

  private positionRight(triggerRect: DOMRect, popoverRect: DOMRect): void {
    const left = triggerRect.right + 5
    const top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2

    this.popoverEl.style.top = `${top + window.scrollY}px`
    this.popoverEl.style.left = `${left + window.scrollX}px`
    this.popoverEl.classList.add('position-right')
  }

  private adjustHorizontalPosition(popoverRect: DOMRect, viewportWidth: number): void {
    const margin = 10 // Margen de seguridad
    const scrollbarWidth = this.cachedScrollbarWidth // Obtener el ancho de la barra de desplazamiento
    const effectiveViewportWidth = viewportWidth // viewportWidth ya excluye la barra de desplazamiento (clientWidth)
    const currentLeft = parseInt(this.popoverEl.style.left, 10) - window.scrollX

    // Ajustar si se sale por la izquierda
    if (currentLeft < margin) {
      this.popoverEl.style.left = `${margin + window.scrollX}px`
    }

    // Ajustar si se sale por la derecha
    if (currentLeft + popoverRect.width > effectiveViewportWidth - margin) {
      this.popoverEl.style.left = `${effectiveViewportWidth - popoverRect.width - margin + window.scrollX}px`
    }
  }

  private adjustVerticalPosition(popoverRect: DOMRect, viewportHeight: number): void {
    const margin = 10 // Margen de seguridad
    const currentTop = parseInt(this.popoverEl.style.top, 10) - window.scrollY

    // Ajustar si se sale por arriba
    if (currentTop < margin) {
      this.popoverEl.style.top = `${margin + window.scrollY}px`
    }

    // Ajustar si se sale por abajo
    if (currentTop + popoverRect.height > viewportHeight - margin) {
      this.popoverEl.style.top = `${viewportHeight - popoverRect.height - margin + window.scrollY}px`
    }
  }

  // Método para calcular el ancho de la barra de desplazamiento
  private getScrollbarWidth(): number {
    // Comprobar si hay scroll vertical en la página
    const hasVerticalScroll = document.body.scrollHeight > window.innerHeight

    if (!hasVerticalScroll) {
      return 0
    }

    // Método para calcular el ancho de la barra de desplazamiento
    // 1. Crear un div con scroll
    const outer = document.createElement('div')
    outer.style.visibility = 'hidden'
    outer.style.overflow = 'scroll'
    document.body.appendChild(outer)

    // 2. Crear un div interno
    const inner = document.createElement('div')
    outer.appendChild(inner)

    // 3. Calcular la diferencia entre el ancho del div externo e interno
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth

    // 4. Eliminar los divs temporales
    outer.parentNode?.removeChild(outer)

    return scrollbarWidth
  }

  private updateConnectionArea(triggerRect: DOMRect, position: PopoverPosition): void {
    if (!this.connectionArea) return

    switch (position) {
      case PopoverPosition.TOP:
        this.connectionArea.style.top = `${triggerRect.top - 5 + window.scrollY}px`
        this.connectionArea.style.left = `${triggerRect.left + window.scrollX}px`
        this.connectionArea.style.width = `${triggerRect.width}px`
        this.connectionArea.style.height = `5px`
        break
      case PopoverPosition.BOTTOM:
        this.connectionArea.style.top = `${triggerRect.bottom + window.scrollY}px`
        this.connectionArea.style.left = `${triggerRect.left + window.scrollX}px`
        this.connectionArea.style.width = `${triggerRect.width}px`
        this.connectionArea.style.height = `5px`
        break
      case PopoverPosition.LEFT:
        this.connectionArea.style.top = `${triggerRect.top + window.scrollY}px`
        this.connectionArea.style.left = `${triggerRect.left - 5 + window.scrollX}px`
        this.connectionArea.style.width = `5px`
        this.connectionArea.style.height = `${triggerRect.height}px`
        break
      case PopoverPosition.RIGHT:
        this.connectionArea.style.top = `${triggerRect.top + window.scrollY}px`
        this.connectionArea.style.left = `${triggerRect.right + window.scrollX}px`
        this.connectionArea.style.width = `5px`
        this.connectionArea.style.height = `${triggerRect.height}px`
        break
    }
  }

  // Verificar si hay un MediaHoverCard superpuesto al trigger actual
  private isMediaHoverCardOverlappingTrigger(): boolean {
    if (!this.currentTrigger) return false

    const triggerRect = this.currentTrigger.getBoundingClientRect()
    const mediaHoverCards = document.querySelectorAll('.MediaHoverCard')

    for (let i = 0; i < mediaHoverCards.length; i++) {
      const card = mediaHoverCards[i] as HTMLElement
      if (card.style.display === 'none') continue

      const cardRect = card.getBoundingClientRect()

      // Verificar si hay superposición entre los rectángulos
      if (
        !(
          cardRect.right < triggerRect.left ||
          cardRect.left > triggerRect.right ||
          cardRect.bottom < triggerRect.top ||
          cardRect.top > triggerRect.bottom
        )
      ) {
        return true
      }
    }
    return false
  }

  private handleLeave(event: MouseEvent): void {
    this.cancelHideTimeout()

    // Si hay un MediaHoverCard superpuesto al trigger, no ocultar
    if (this.isMediaHoverCardOverlappingTrigger()) {
      return
    }

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
