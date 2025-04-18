import './styles.scss'
import manager, { Provider, ProviderManager, SearchType } from './provider/provider'

// Usamos un WeakSet para asegurarnos de procesar cada elemento solo una vez.
const processedElements = new WeakSet()

const providerManager: ProviderManager = manager

function makeButtonToolbar(searchTerm: string, searchType: SearchType, toolbarClasses: string[] = []): HTMLElement {
  let toolbar: HTMLElement = document.createElement('div')
  toolbar.classList.add('filminlinks-toolbar', ...toolbarClasses)

  providerManager.all().forEach((provider: Provider) => {
    toolbar.appendChild(provider.makeButton(provider.makeUrl(searchTerm, searchType)))
  })

  return toolbar
}

/**
 * Obtiene los elementos que están sin procesar.
 */
function getUnprocessedElements(elements: NodeListOf<HTMLElement>): Array<HTMLElement> {
  return Array.from(elements).filter((element: HTMLElement): boolean => !processedElements.has(element))
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

  getUnprocessedElements(titles).forEach((element: HTMLElement): void => {
    const isElementInHero: boolean = !!element.closest("[class*='hero']")
    const isElementInMediaHoverCard: boolean = !!element.closest('.MediaHoverCard')
    const title: string = element.textContent?.trim() || ''

    if (!title) {
      return
    }

    const extraClasses: string[] = isElementInHero || isElementInMediaHoverCard ? ['inline'] : []
    element.prepend(makeButtonToolbar(title, SearchType.title, extraClasses))
    processedElements.add(element)
  })

  getUnprocessedElements(cards).forEach((element: HTMLElement): void => {
    const toolbar = element.querySelector('.card-options-controls')
    const titleEl = element.querySelector('.info-title')
    const title: string = titleEl?.textContent?.trim() || ''

    if (!title || !toolbar) {
      return
    }

    toolbar.append(makeButtonToolbar(title, SearchType.title))
    processedElements.add(element)
  })

  getUnprocessedElements(posters).forEach((element: HTMLElement): void => {
    const title: string = element.getAttribute('data-track-property-media-title')?.trim() || ''

    if (!title) {
      return
    }

    // element.append(makeButtonToolbar(title, SearchType.title))
    element.insertAdjacentElement('beforebegin', makeButtonToolbar(title, SearchType.title, ['tabs']))
    processedElements.add(element)
  })

  getUnprocessedElements(players).forEach((element: HTMLElement): void => {
    const title: string = element.textContent?.trim() || ''

    if (!title) {
      return
    }

    element.prepend(makeButtonToolbar(title, SearchType.title, ['inline']))
    processedElements.add(element)
  })
}

/**
 * Procesa los elementos de tipo "director"
 */
function processDirectors(): void {
  const directors: NodeListOf<HTMLElement> = document.querySelectorAll(`[href^="/director"]`)

  getUnprocessedElements(directors).forEach((element: HTMLElement): void => {
    const director: string = element.textContent?.trim() || ''

    if (!director) {
      return
    }

    element.insertAdjacentElement('beforebegin', makeButtonToolbar(director, SearchType.director, ['inline']))
    processedElements.add(element)
  })
}

/**
 * Procesa los elementos de tipo "actor"
 */
function processActors(): void {
  const actors: NodeListOf<HTMLElement> = document.querySelectorAll(`[href^="/actor"], [href^="/actriz"]`)

  getUnprocessedElements(actors).forEach((element: HTMLElement): void => {
    const actor: string = element.textContent?.trim() || ''

    if (!actor) {
      return
    }

    element.insertAdjacentElement('beforebegin', makeButtonToolbar(actor, SearchType.cast, ['inline']))
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
