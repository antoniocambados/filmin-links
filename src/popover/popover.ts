/**
 * Filmin Links
 * Copyright (C) 2025  Antonio Cambados
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import manager, { AVAILABLE_PROVIDERS, ProviderManager } from '../provider/provider-manager'
import { Provider, SearchType } from '../provider/provider'
import PopoverManager from './popover-manager'

/**
 * Referencia al gestor de proveedores de búsqueda.
 * Provee acceso a los distintos servicios de búsqueda de películas.
 */
const providerManager: ProviderManager = manager

/**
 * Extiende la interfaz HTMLElement para incluir una propiedad opcional.
 * Permite asociar un objeto Popover a un elemento DOM.
 */
export interface PopoverElement extends HTMLElement {
  filminlinksPopover?: Popover | undefined
}

/**
 * Clase principal para gestionar popups de búsqueda de películas.
 *
 * Se encarga de mostrar un panel flotante cuando el usuario interactúa
 * con elementos marcados como "triggers", presentando opciones para buscar
 * el término seleccionado en diferentes plataformas de cine.
 */
export class Popover {
  private readonly searchTerm: string // Término de búsqueda
  private readonly searchType: SearchType // Tipo de búsqueda (título, director, etc.)
  private readonly popoverClasses: string[] // Clases CSS adicionales
  private readonly trigger: HTMLElement // Elemento que activa el popover
  private readonly popoverManager: PopoverManager // Gestor central de popovers
  private popoverContent: HTMLElement // Contenido del popover

  /**
   * Constructor del popover de búsqueda.
   *
   * @param trigger Elemento DOM que activa el popover al pasar el ratón
   * @param searchTerm Término de búsqueda a utilizar
   * @param searchType Categoría de búsqueda (título, director, etc.)
   * @param popoverClasses Clases CSS adicionales para personalizar el popover
   */
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

  /**
   * Configura los eventos para mostrar/ocultar el popover cuando el usuario
   * interactúa con el elemento trigger.
   */
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

  /**
   * Reconstruye el contenido del popover.
   * Útil cuando cambia la configuración o los proveedores disponibles.
   */
  rebuild(): void {
    this.popoverContent = this.createPopoverContent()
  }

  /**
   * Crea la estructura DOM del popover con todos sus componentes.
   *
   * El popover tiene tres secciones:
   * - Cabecera con logo y título
   * - Barra de herramientas con botones de proveedores (cargada asíncronamente
   * según los proveedores habilitados por el usuario)
   * - Pie con enlace a configuración
   */
  private createPopoverContent(): HTMLElement {
    const popover: HTMLElement = document.createElement('div')
    popover.classList.add('filminlinks-popover', ...this.popoverClasses)

    const header: HTMLElement = this.makeHeader()
    const toolbar = this.makeRow('filminlinks-popover-row-toolbar')

    popover.appendChild(header)
    popover.appendChild(toolbar)

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

  /**
   * Construye la cabecera del popover con logo y título.
   */
  private makeHeader(): HTMLElement {
    const row: HTMLElement = this.makeRow('filminlinks-popover-row-header')

    row.appendChild(this.makeLogo())
    row.appendChild(this.makeTitle())

    return row
  }

  /**
   * Crea el elemento de título que muestra el tipo de búsqueda
   * y el término de búsqueda.
   */
  private makeTitle(): HTMLElement {
    const title: HTMLElement = document.createElement('div')
    let preTitleContent

    if (this.searchType === SearchType.title) {
      preTitleContent = 'Buscar título'
    } else if (this.searchType === SearchType.director) {
      preTitleContent = 'Buscar en dirección'
    } else if (this.searchType === SearchType.cast) {
      preTitleContent = 'Buscar en reparto'
    } else {
      preTitleContent = 'Buscar'
    }

    const p: HTMLParagraphElement = document.createElement('p')
    p.classList.add('filminlinks-popover-title')
    p.textContent = preTitleContent
    const span: HTMLSpanElement = document.createElement('span')
    span.classList.add('filminlinks-popover-term')
    span.textContent = this.searchTerm
    p.append(document.createElement('br'), span)
    title.append(p)

    return title.firstElementChild as HTMLElement
  }

  /**
   * Genera el elemento de logo desde los iconos de la extensión.
   */
  private makeLogo(): HTMLElement {
    const imgUrl = chrome.runtime.getURL('icons/full.svg')
    const img = document.createElement('img')

    img.src = imgUrl
    img.alt = 'FilminLinks'
    img.classList.add('filminlinks-logo')

    return img
  }

  /**
   * Construye la barra de herramientas con enlaces a proveedores.
   *
   * Este método es asíncrono porque necesita obtener la configuración
   * del usuario.
   */
  private async makeToolbar(): Promise<HTMLElement> {
    const row: HTMLElement = this.makeRow('filminlinks-popover-row-center')

    // Obtener los proveedores habilitados desde la configuración
    const providerNames = await this.getEnabledProviders()
    const providers = providerManager.get(providerNames)

    // Crear un botón para cada proveedor
    providers.forEach((provider: Provider) => {
      row.appendChild(provider.makeButton(provider.makeUrl(this.searchTerm, this.searchType)))
    })

    return row
  }

  /**
   * Crea una fila contenedora para los elementos del popover.
   */
  private makeRow(...classes: string[]): HTMLElement {
    let row: HTMLElement = document.createElement('div')
    row.classList.add('filminlinks-popover-row', ...classes)

    return row
  }

  /**
   * Obtiene la lista de proveedores habilitados desde la configuración con el orden preferido.
   *
   * Si no hay configuración explícita, usa todos los proveedores disponibles.
   */
  private async getEnabledProviders(): Promise<string[]> {
    const defaultProviders = AVAILABLE_PROVIDERS

    const items = await chrome.storage.sync.get({
      enabledProviders: defaultProviders,
      providersOrder: defaultProviders,
    })

    // Ordenar los proveedores habilitados según el orden definido
    const enabledProviders = [...items.enabledProviders]

    enabledProviders.sort((a, b) => {
      const indexA = items.providersOrder.indexOf(a)
      const indexB = items.providersOrder.indexOf(b)

      // Si alguno no está en la lista de orden, mantener su posición relativa original
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1

      return indexA - indexB
    })

    return enabledProviders
  }
}
