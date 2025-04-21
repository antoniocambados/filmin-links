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
 * Validadores para diferentes tipos de enlaces
 */
const validators = {
  isTitleLink: (link: string): boolean => /^(https?:\/\/(www\.)?filmin\.es)?\/(pelicula)\//.test(link),
  isCastLink: (link: string): boolean => /^(https?:\/\/(www\.)?filmin\.es)?\/(actor|actriz)\//.test(link),
  isDirectorLink: (link: string): boolean => /^(https?:\/\/(www\.)?filmin\.es)?\/(directora?)\//.test(link),
}

/**
 * Extractores de texto para diferentes tipos de elementos
 */
const extractors = {
  textContent: (element: HTMLElement): string => element.textContent?.trim() || '',

  dataTrackTitle: (element: HTMLElement): string =>
    element.getAttribute('data-track-property-media-title')?.trim() || '',

  dataTrackContentOrText: (element: HTMLElement): string =>
    element.getAttribute('data-track-property-content-text')?.trim() || element.textContent?.trim() || '',

  cardTitle: (element: HTMLElement): string => {
    const titleEl = element.querySelector('.info-title')
    return titleEl?.textContent?.trim() || ''
  },
}

/**
 * Configuración de los elementos a procesar
 */
interface ElementConfig {
  selector: string
  extractor: (element: HTMLElement) => string
  validator?: (element: HTMLElement) => boolean
  searchType: SearchType
  container?: (element: HTMLElement) => HTMLElement
}

const elementConfigs: ElementConfig[] = [
  // Configuraciones para títulos
  {
    selector: 'h1[itemprop=name], h1.display-1, h2.display-1, .card .info-title, .jwc-title-primary',
    extractor: extractors.textContent,
    searchType: SearchType.title,
  },
  {
    selector: '.card',
    extractor: extractors.cardTitle,
    validator: (element: HTMLElement): boolean => !!element.querySelector('.card-options-controls'),
    searchType: SearchType.title,
  },
  {
    selector: '[data-track-property-content-id="media_poster"], [data-track-property-content-id="media_card"]',
    extractor: extractors.dataTrackTitle,
    searchType: SearchType.title,
  },
  {
    selector: '[data-track-property-content-id="wildcard_vertical_coverart"]',
    extractor: extractors.dataTrackContentOrText,
    validator: (element: HTMLElement): boolean => validators.isTitleLink(element.getAttribute('href')?.trim() || ''),
    searchType: SearchType.title,
  },
  {
    selector: '[data-track-property-content-id="custom_block_trailers_media_title"]',
    extractor: extractors.dataTrackContentOrText,
    searchType: SearchType.title,
  },

  // Configuraciones para directores
  {
    selector: '[href^="/director"], [data-mix-panel-section-type="Director"] h1',
    extractor: extractors.textContent,
    searchType: SearchType.director,
  },

  // Configuraciones para actores
  {
    selector: '[href^="/actor"], [href^="/actriz"]',
    extractor: extractors.textContent,
    searchType: SearchType.cast,
  },
]

/**
 * Procesa los elementos según la configuración proporcionada
 */
function processElementsByConfig(config: ElementConfig): void {
  const elements: NodeListOf<HTMLElement> = document.querySelectorAll(config.selector)
  const unprocessedElements: PopoverElement[] = getUnprocessedElements(elements)

  unprocessedElements.forEach((element: PopoverElement): void => {
    // Validar el elemento si hay una función validadora
    if (config.validator && !config.validator(element)) {
      return
    }

    // Extraer el texto
    const text: string = config.extractor(element)
    if (!text) {
      return
    }

    // Determinar el elemento contenedor si se especifica
    const targetElement: HTMLElement = config.container ? config.container(element) : element

    // Crear el popover
    element.filminlinksPopover = new Popover(targetElement, text, config.searchType)
    processedElements.add(element)
  })
}

/**
 * Procesa todos los elementos
 */
function processElements(): void {
  elementConfigs.forEach(processElementsByConfig)
}

// Procesamos los elementos existentes a la hora de cargar el script
processElements()

// Se configura un MutationObserver para detectar cambios en el DOM y procesar nuevos elementos.
const observer = new MutationObserver((): void => {
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
      processedElements.forEach((element: PopoverElement): void => {
        element.filminlinksPopover?.rebuild()
      })
    }

    // No necesitamos hacer nada específico si cambia la posición preferida
    // PopoverManager ya escucha estos cambios directamente
  }
})
