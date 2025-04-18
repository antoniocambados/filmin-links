import './styles.scss'
import { SearchType } from './provider/provider'
import { Toolbar, ToolbarElement } from './toolbar'

// Usamos un WeakSet para asegurarnos de procesar cada elemento solo una vez.
const processedElements = new WeakSet()

/**
 * Obtiene los elementos que están sin procesar.
 */
function getUnprocessedElements(elements: NodeListOf<ToolbarElement>): Array<ToolbarElement> {
  return Array.from(elements).filter((element: ToolbarElement): boolean => !processedElements.has(element))
}

/**
 * Procesa los elementos de tipo "título" (aka película/corto/serie/obra).
 */
function processTitles(): void {
  const titles: NodeListOf<HTMLElement> = document.querySelectorAll(
    `h1[itemprop=name], h1.display-1, h2.display-1, .card .info-title, .MediaHoverCard__summary__title`,
  )
  const cards: NodeListOf<HTMLElement> = document.querySelectorAll(`.card`)
  const posters: NodeListOf<HTMLElement> = document.querySelectorAll(
    `[data-track-property-content-id="media_poster"], [data-track-property-content-id="media_card"]`,
  )
  const players: NodeListOf<HTMLElement> = document.querySelectorAll(`.jwc-title-primary`)

  getUnprocessedElements(titles).forEach((element: ToolbarElement): void => {
    const title: string = element.textContent?.trim() || ''

    if (!title) {
      return
    }

    element.toolbar = new Toolbar(element, title, SearchType.title)
    processedElements.add(element)
  })

  getUnprocessedElements(cards).forEach((element: ToolbarElement): void => {
    const toolbar = element.querySelector('.card-options-controls')
    const titleEl = element.querySelector('.info-title')
    const title: string = titleEl?.textContent?.trim() || ''

    if (!title || !toolbar) {
      return
    }

    element.toolbar = new Toolbar(element, title, SearchType.title)
    processedElements.add(element)
  })

  getUnprocessedElements(posters).forEach((element: ToolbarElement): void => {
    const title: string = element.getAttribute('data-track-property-media-title')?.trim() || ''

    if (!title) {
      return
    }

    element.toolbar = new Toolbar(element, title, SearchType.title)
    processedElements.add(element)
  })

  getUnprocessedElements(players).forEach((element: ToolbarElement): void => {
    const title: string = element.textContent?.trim() || ''

    if (!title) {
      return
    }

    element.toolbar = new Toolbar(element, title, SearchType.title)
    processedElements.add(element)
  })
}

/**
 * Procesa los elementos de tipo "director"
 */
function processDirectors(): void {
  const directors: NodeListOf<HTMLElement> = document.querySelectorAll(`[href^="/director"]`)

  getUnprocessedElements(directors).forEach((element: ToolbarElement): void => {
    const director: string = element.textContent?.trim() || ''

    if (!director) {
      return
    }

    element.toolbar = new Toolbar(element, director, SearchType.director)
    processedElements.add(element)
  })
}

/**
 * Procesa los elementos de tipo "actor"
 */
function processActors(): void {
  const actors: NodeListOf<HTMLElement> = document.querySelectorAll(`[href^="/actor"], [href^="/actriz"]`)

  getUnprocessedElements(actors).forEach((element: ToolbarElement): void => {
    const actor: string = element.textContent?.trim() || ''

    if (!actor) {
      return
    }

    element.toolbar = new Toolbar(element, actor, SearchType.cast)
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
