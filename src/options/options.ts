import './options.scss'

interface Provider {
  id: string
  name: string
}

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

// Función para guardar las opciones
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

// Función para mostrar un mensaje de feedback
function showFeedback(message: string) {
  const notification = document.createElement('div')
  notification.className = 'notification'
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => notification.remove(), 3000)
}

// Función para restaurar valores predeterminados
async function restoreDefaults(event: Event) {
  event.preventDefault()

  await chrome.storage.sync.set({
    enabledProviders: AVAILABLE_PROVIDERS,
    popoverPosition: DEFAULT_POPOVER_POSITION,
  })

  // Restaurar la interfaz de usuario
  loadOptions()

  // Mostrar feedback
  showFeedback('Valores predeterminados restaurados')
}

// Función para crear checkboxes de proveedores
function createProviderCheckboxes(enabledProviders: string[]) {
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

// Función para cargar las opciones guardadas
async function loadOptions() {
  const result = await chrome.storage.sync.get({
    enabledProviders: AVAILABLE_PROVIDERS,
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
