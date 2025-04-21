import './styles.scss'
import { SearchType } from './provider/provider'
import { Popover, PopoverElement } from './popover/popover'

// Usamos un WeakSet para asegurarnos de procesar cada elemento solo una vez.
const processedElements: Set<PopoverElement> = new Set()

/**
 * Obtiene los elementos que están sin procesar.
 */
function getUnprocessedElements(elements: NodeListOf<PopoverElement>): Array<PopoverElement> {
  return Array.from(elements).filter((element: PopoverElement): boolean => !processedElements.has(element))
}

/**
 * Procesa los elementos de tipo "título" (aka película/corto/serie/obra).
 */
function processTitles(): void {
  const titles: NodeListOf<HTMLElement> = document.querySelectorAll(
    `h1[itemprop=name], h1.display-1, h2.display-1, .card .info-title`,
  )
  const cards: NodeListOf<HTMLElement> = document.querySelectorAll(`.card`)
  const posters: NodeListOf<HTMLElement> = document.querySelectorAll(
    `[data-track-property-content-id="media_poster"], [data-track-property-content-id="media_card"]`,
  )
  const players: NodeListOf<HTMLElement> = document.querySelectorAll(`.jwc-title-primary`)

  getUnprocessedElements(titles).forEach((element: PopoverElement): void => {
    const title: string = element.textContent?.trim() || ''

    if (!title) {
      return
    }

    element.filminlinksPopover = new Popover(element, title, SearchType.title)
    processedElements.add(element)
  })

  getUnprocessedElements(cards).forEach((element: PopoverElement): void => {
    const toolbar = element.querySelector('.card-options-controls')
    const titleEl = element.querySelector('.info-title')
    const title: string = titleEl?.textContent?.trim() || ''

    if (!title || !toolbar) {
      return
    }

    element.filminlinksPopover = new Popover(element, title, SearchType.title)
    processedElements.add(element)
  })

  getUnprocessedElements(posters).forEach((element: PopoverElement): void => {
    const title: string = element.getAttribute('data-track-property-media-title')?.trim() || ''

    if (!title) {
      return
    }

    element.filminlinksPopover = new Popover(element, title, SearchType.title)
    processedElements.add(element)
  })

  getUnprocessedElements(players).forEach((element: PopoverElement): void => {
    const title: string = element.textContent?.trim() || ''

    if (!title) {
      return
    }

    element.filminlinksPopover = new Popover(element, title, SearchType.title)
    processedElements.add(element)
  })
}

/**
 * Procesa los elementos de tipo "director"
 */
function processDirectors(): void {
  const directors: NodeListOf<HTMLElement> = document.querySelectorAll(`[href^="/director"]`)

  getUnprocessedElements(directors).forEach((element: PopoverElement): void => {
    const director: string = element.textContent?.trim() || ''

    if (!director) {
      return
    }

    element.filminlinksPopover = new Popover(element, director, SearchType.director)
    processedElements.add(element)
  })
}

/**
 * Procesa los elementos de tipo "actor"
 */
function processActors(): void {
  const actors: NodeListOf<HTMLElement> = document.querySelectorAll(`[href^="/actor"], [href^="/actriz"]`)

  getUnprocessedElements(actors).forEach((element: PopoverElement): void => {
    const actor: string = element.textContent?.trim() || ''

    if (!actor) {
      return
    }

    element.filminlinksPopover = new Popover(element, actor, SearchType.cast)
    processedElements.add(element)
  })
}

/**
 * Procesa todos los elementos
 */
function processElements(): void {
  processTitles()
  processActors()
  processDirectors()
}

// Procesamos los elementos existentes a la hora de cargar el script
processElements()

// Se configura un MutationObserver para detectar cambios en el DOM y procesar nuevos elementos.
const observer = new MutationObserver(() => {
  processElements()
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    // Si cambian los proveedores habilitados, reconstruir los popovers
    if (changes.enabledProviders) {
      processedElements.forEach((element) => {
        element.filminlinksPopover?.rebuild()
      })
    }

    // No necesitamos hacer nada específico si cambia la posición preferida
    // PopoverManager ya escucha estos cambios directamente
  }
})
