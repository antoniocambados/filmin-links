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

import './options.scss'
import Sortable from 'sortablejs'

/**
 * Interfaz que define la estructura de un proveedor de búsqueda.
 */
interface Provider {
  /** Identificador único del proveedor */
  id: string
  /** Nombre visible del proveedor */
  name: string
}

/**
 * Posiciones disponibles para mostrar el popover.
 */
const PopoverPosition = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
}

const DEFAULT_POPOVER_POSITION: string = PopoverPosition.TOP
const AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 'filmaffinity',
    name: 'FilmAffinity',
  },
  {
    id: 'letterboxd',
    name: 'Letterboxd',
  },
  {
    id: 'rottentomatoes',
    name: 'Rotten Tomatoes',
  },
  {
    id: 'imdb',
    name: 'IMDB',
  },
]

// DOM Elements
const form = document.getElementById('options-form') as HTMLFormElement
const providersList = document.getElementById('providers-list') as HTMLDivElement
const positionSelect = document.getElementById('popoverPosition') as HTMLSelectElement

/**
 * Guarda las opciones seleccionadas por el usuario.
 *
 * @param event Evento del formulario
 */
async function saveOptions(event: Event) {
  event.preventDefault()

  // Obtener los proveedores en el orden actual
  const orderedProviders = Array.from(document.querySelectorAll<HTMLDivElement>('.provider-item')).map((item) => ({
    id: item.dataset.providerId as string,
    enabled: item.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked || false,
  }))

  // Extraer solo los IDs de proveedores habilitados
  const enabledProviders = orderedProviders.filter((provider) => provider.enabled).map((provider) => provider.id)

  // Guardar también el orden de todos los proveedores
  const providersOrder = orderedProviders.map((provider) => provider.id)

  // Obtener la posición seleccionada
  const popoverPosition = positionSelect.value

  // Guardar en storage
  await chrome.storage.sync.set({
    enabledProviders,
    providersOrder,
    popoverPosition,
  })

  // Mostrar feedback
  showFeedback('Opciones guardadas correctamente')
}

/**
 * Muestra un mensaje de notificación temporal.
 *
 * @param message Texto a mostrar en la notificación
 */
function showFeedback(message: string) {
  const notification = document.createElement('div')
  notification.className = 'notification'
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => notification.remove(), 3000)
}

/**
 * Restaura las opciones a sus valores predeterminados.
 *
 * Restablece tanto la configuración almacenada como la
 * interfaz de usuario a los valores iniciales.
 *
 * @param event Evento del botón de reset
 */
async function restoreDefaults(event: Event) {
  event.preventDefault()

  const defaultProvidersIds = AVAILABLE_PROVIDERS.map((p) => p.id)

  await chrome.storage.sync.set({
    enabledProviders: defaultProvidersIds,
    providersOrder: defaultProvidersIds,
    popoverPosition: DEFAULT_POPOVER_POSITION,
  })

  // Restaurar la interfaz de usuario
  loadOptions()

  // Mostrar feedback
  showFeedback('Valores predeterminados restaurados')
}

/**
 * Crea los elementos arrastrables para cada proveedor disponible.
 *
 * @param enabledProviders Lista de IDs de proveedores habilitados
 * @param providersOrder Lista ordenada de IDs de proveedores
 */
function createProviderItems(enabledProviders: string[], providersOrder: string[]) {
  providersList.innerHTML = ''

  // Obtener los proveedores en el orden especificado
  const orderedProviders = [...AVAILABLE_PROVIDERS]

  // Ordenar los proveedores según providersOrder
  orderedProviders.sort((a, b) => {
    const indexA = providersOrder.indexOf(a.id)
    const indexB = providersOrder.indexOf(b.id)

    // Si alguno no está en la lista, ponerlo al final
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })

  orderedProviders.forEach((provider) => {
    const isChecked = enabledProviders.includes(provider.id)

    // Crear contenedor arrastrable
    const item = document.createElement('div')
    item.className = 'provider-item'
    item.dataset.providerId = provider.id

    // Agregar el handle para arrastrar
    const dragHandle = document.createElement('div')
    dragHandle.className = 'drag-handle'
    dragHandle.textContent = '⋮⋮' // Icono de arrastre

    // Crear el contenedor de checkbox y etiqueta
    const label = document.createElement('label')
    label.className = 'checkbox-container'

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.name = 'provider'
    input.value = provider.id
    input.checked = isChecked

    const span = document.createElement('span')
    span.className = 'provider-name'
    span.textContent = provider.name

    // Ensamblar el elemento
    label.appendChild(input)
    label.appendChild(span)
    item.appendChild(dragHandle)
    item.appendChild(label)
    providersList.appendChild(item)
  })

  // Inicializar la funcionalidad de arrastrar y soltar
  initDragAndDrop()
}

/**
 * Inicializa la funcionalidad de arrastrar y soltar para los proveedores.
 */
function initDragAndDrop() {
  // Inicializar Sortable en la lista de proveedores
  Sortable.create(providersList, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
  })
}

/**
 * Carga las opciones guardadas y actualiza la interfaz.
 *
 * Recupera la configuración del almacenamiento de Chrome y
 * configura los controles del formulario según los valores guardados.
 */
async function loadOptions() {
  const defaultProvidersIds = AVAILABLE_PROVIDERS.map((p) => p.id)

  const result = await chrome.storage.sync.get({
    enabledProviders: defaultProvidersIds,
    providersOrder: defaultProvidersIds,
    popoverPosition: PopoverPosition.TOP,
  })

  // Establecer valores en la interfaz
  createProviderItems(result.enabledProviders, result.providersOrder)
  positionSelect.value = result.popoverPosition
}

/**
 * Carga la versión de la extensión desde el archivo manifest.json.
 */
async function loadVersionNumber() {
  // Obtener la versión del manifest y mostrarla
  try {
    const manifestData = await fetch(chrome.runtime.getURL('manifest.json')).then((response) => response.json())
    const versionElement = document.getElementById('version-number')
    if (versionElement && manifestData.version) {
      versionElement.textContent = `Versión ${manifestData.version}`
    }
  } catch (error) {
    console.error('Error al cargar la versión desde manifest.json:', error)
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadOptions)
document.addEventListener('DOMContentLoaded', loadVersionNumber)
form.addEventListener('submit', saveOptions)
form.addEventListener('reset', restoreDefaults)
