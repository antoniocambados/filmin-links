import './styles.scss'
import Logger from './logger'
import { Popover, PopoverElement } from './popover/popover'
import { SearchType } from './provider/provider'

/**
 * Conjunto que almacena los elementos ya procesados para evitar duplicados.
 * Usamos un Set para asegurarnos de procesar cada elemento solo una vez.
 */
const processedElements: Set<PopoverElement> = new Set()

/**
 * Obtiene los elementos que están sin procesar.
 *
 * @param elements Lista de elementos DOM candidatos a procesar
 * @returns Array con los elementos que aún no han sido procesados
 */
function getUnprocessedElements(elements: NodeListOf<PopoverElement>): Array<PopoverElement> {
  return Array.from(elements).filter((element: PopoverElement): boolean => !processedElements.has(element))
}

/**
 * Validadores para diferentes tipos de enlaces.
 * Contiene funciones que determinan si una URL corresponde a un título, actor o director.
 */
const validators = {
  /**
   * Verifica si un enlace corresponde a una película.
   *
   * @param link URL a validar
   * @returns true si es un enlace a una película
   */
  isTitleLink: (link: string): boolean => /^(https?:\/\/(www\.)?filmin\.es)?\/(pelicula)\//.test(link),

  /**
   * Verifica si un enlace corresponde a un actor o actriz.
   *
   * @param link URL a validar
   * @returns true si es un enlace a un actor o actriz
   */
  isCastLink: (link: string): boolean => /^(https?:\/\/(www\.)?filmin\.es)?\/(actor|actriz)\//.test(link),

  /**
   * Verifica si un enlace corresponde a un director o directora.
   *
   * @param link URL a validar
   * @returns true si es un enlace a un director o directora
   */
  isDirectorLink: (link: string): boolean => /^(https?:\/\/(www\.)?filmin\.es)?\/(directora?)\//.test(link),
}

/**
 * Extractores de texto para diferentes tipos de elementos.
 * Proporciona funciones para obtener el texto relevante de diferentes estructuras DOM.
 */
const extractors = {
  /**
   * Extrae el texto contenido en un elemento.
   *
   * @param element Elemento DOM del que extraer el texto
   * @returns Texto contenido en el elemento
   */
  textContent: (element: HTMLElement): string => element.textContent?.trim() || '',

  /**
   * Extrae el título de una película desde un atributo de seguimiento.
   *
   * @param element Elemento DOM que contiene el atributo data-track-property-media-title
   * @returns Título de la película
   */
  dataTrackTitle: (element: HTMLElement): string =>
    element.getAttribute('data-track-property-media-title')?.trim() || '',

  /**
   * Extrae texto desde un atributo de seguimiento o del contenido del elemento.
   *
   * @param element Elemento DOM del que extraer el texto
   * @returns Texto extraído del atributo o del contenido
   */
  dataTrackContentOrText: (element: HTMLElement): string =>
    element.getAttribute('data-track-property-content-text')?.trim() || element.textContent?.trim() || '',

  /**
   * Extrae el título de una tarjeta de película.
   *
   * @param element Elemento DOM que contiene una tarjeta de película
   * @returns Título de la película
   */
  cardTitle: (element: HTMLElement): string => {
    const titleEl = element.querySelector('.info-title')
    return titleEl?.textContent?.trim() || ''
  },
}

/**
 * Configuración de los elementos a procesar.
 * Define cómo identificar y extraer información de diferentes elementos del DOM.
 */
interface ElementConfig {
  /** Selector CSS para identificar los elementos */
  selector: string
  /** Función para extraer el texto relevante del elemento */
  extractor: (element: HTMLElement) => string
  /** Función opcional para validar si el elemento debe ser procesado */
  validator?: (element: HTMLElement) => boolean
  /** Tipo de búsqueda a realizar (título, director, reparto) */
  searchType: SearchType
  /** Función opcional para determinar el elemento contenedor donde se mostrará el popover */
  container?: (element: HTMLElement) => HTMLElement
}

/**
 * Lista de configuraciones para los diferentes tipos de elementos a procesar.
 * Cada configuración define cómo identificar y extraer información de un tipo específico de elemento.
 */
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
 * Procesa los elementos según la configuración proporcionada.
 *
 * Busca elementos que coincidan con el selector de la configuración,
 * extrae la información relevante y crea un popover para cada elemento.
 *
 * @param config Configuración que define cómo procesar los elementos
 */
function processElementsByConfig(config: ElementConfig): void {
  const elements: NodeListOf<HTMLElement> = document.querySelectorAll(config.selector)
  const unprocessedElements: PopoverElement[] = getUnprocessedElements(elements)

  unprocessedElements.forEach((element: PopoverElement): void => {
    // Validar el elemento si hay una función validadora
    if (config.validator && !config.validator(element)) {
      Logger.warn('El elemento no cumple con los requisitos para ser procesado', element)
      return
    }

    // Extraer el texto
    const text: string = config.extractor(element)
    if (!text) {
      Logger.warn('No se ha extraído texto para la búsqueda', element)
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
 * Procesa todos los elementos configurados en la página.
 *
 * Aplica todas las configuraciones definidas para detectar y procesar
 * los diferentes tipos de elementos (películas, directores, actores).
 */
function processElements(): void {
  elementConfigs.forEach(processElementsByConfig)
}

Logger.log('Iniciando...')

// Procesamos los elementos existentes a la hora de cargar el script
processElements()

/**
 * Observer que detecta cambios en el DOM para procesar nuevos elementos.
 * Esto permite que la extensión funcione correctamente en páginas con carga dinámica.
 */
const observer = new MutationObserver((): void => {
  processElements()
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
})

/**
 * Listener para cambios en la configuración de la extensión.
 * Permite actualizar los popovers cuando cambian las preferencias del usuario.
 */
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
