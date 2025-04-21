import './options.scss'

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
    id: 'imdb',
    name: 'IMDB',
  },
  {
    id: 'letterboxd',
    name: 'Letterboxd',
  },
]

// DOM Elements
const form = document.getElementById('options-form') as HTMLFormElement
const providersList = document.getElementById('providers-list') as HTMLDivElement
const positionSelect = document.getElementById('popoverPosition') as HTMLSelectElement

/**
 * Guarda las opciones seleccionadas por el usuario.
 *
 * Recoge los valores actuales del formulario y los almacena
 * en la configuración sincronizada de Chrome.
 *
 * @param event Evento del formulario
 */
async function saveOptions(event: Event) {
  event.preventDefault()

  // Obtener los proveedores seleccionados
  const enabledProviders = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="provider"]:checked'),
  ).map((checkbox) => checkbox.value)

  // Obtener la posición seleccionada
  const popoverPosition = positionSelect.value

  // Guardar en storage
  await chrome.storage.sync.set({
    enabledProviders,
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

  await chrome.storage.sync.set({
    enabledProviders: AVAILABLE_PROVIDERS.map((p) => p.id),
    popoverPosition: DEFAULT_POPOVER_POSITION,
  })

  // Restaurar la interfaz de usuario
  loadOptions()

  // Mostrar feedback
  showFeedback('Valores predeterminados restaurados')
}

/**
 * Crea los checkboxes para cada proveedor disponible.
 *
 * Genera dinámicamente la lista de proveedores y marca como
 * seleccionados los que están actualmente habilitados.
 *
 * @param enabledProviders Lista de IDs de proveedores habilitados
 */
function createProviderCheckboxes(enabledProviders: string[]) {
  providersList.innerHTML = ''

  AVAILABLE_PROVIDERS.forEach((provider) => {
    const isChecked = enabledProviders.includes(provider.id)

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

    label.appendChild(input)
    label.appendChild(span)
    providersList.appendChild(label)
  })
}

/**
 * Carga las opciones guardadas y actualiza la interfaz.
 *
 * Recupera la configuración del almacenamiento de Chrome y
 * configura los controles del formulario según los valores guardados.
 */
async function loadOptions() {
  const result = await chrome.storage.sync.get({
    enabledProviders: AVAILABLE_PROVIDERS.map((p) => p.id),
    popoverPosition: PopoverPosition.TOP,
  })

  // Establecer valores en la interfaz
  createProviderCheckboxes(result.enabledProviders)
  positionSelect.value = result.popoverPosition
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadOptions)
form.addEventListener('submit', saveOptions)
form.addEventListener('reset', restoreDefaults)
