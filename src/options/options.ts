import './options.scss'

interface Provider {
  id: string
  name: string
  description: string
  icon?: string
}

interface ProviderSettings {
  enabledProviders: string[]
}

const AVAILABLE_PROVIDERS: Provider[] = [
  {
    id: 'filmaffinity',
    name: 'FilmAffinity',
    description: 'Búsqueda de películas y valoraciones',
  },
  {
    id: 'imdb',
    name: 'IMDB',
    description: 'Base de datos de películas internacional',
  },
  {
    id: 'letterboxd',
    name: 'Letterboxd',
    description: 'Base de datos de películas internacional',
  },
]

class OptionsManager {
  private static DEFAULT_SETTINGS: ProviderSettings = {
    enabledProviders: AVAILABLE_PROVIDERS.map((p) => p.id), // Por defecto, todos activados
  }

  private form: HTMLFormElement
  private providersList: HTMLDivElement

  constructor() {
    this.form = document.getElementById('options-form') as HTMLFormElement
    this.providersList = document.querySelector('.providers-list') as HTMLDivElement
    this.initializeForm()
  }

  private async initializeForm(): Promise<void> {
    const settings = await this.loadSettings()
    this.renderProviders(settings.enabledProviders)

    this.form.addEventListener('submit', (e) => this.handleSubmit(e))
    this.form.addEventListener('reset', (e) => this.handleReset(e))
  }

  private renderProviders(enabledProviders: string[]): void {
    this.providersList.innerHTML = ''

    AVAILABLE_PROVIDERS.forEach((provider) => {
      const item = document.createElement('div')
      item.className = 'provider-item'

      item.innerHTML = `
        <label>
          <input type="checkbox"
                 name="provider-${provider.id}"
                 value="${provider.id}"
                 ${enabledProviders.includes(provider.id) ? 'checked' : ''}>
          ${provider.icon ? `<img src="${provider.icon}" class="provider-icon" alt="">` : ''}
          <span class="provider-name">${provider.name}</span>
          <span class="provider-description">${provider.description}</span>
        </label>
      `

      this.providersList.appendChild(item)
    })
  }

  private async loadSettings(): Promise<ProviderSettings> {
    return new Promise((resolve) => {
      try {
        console.log('Loading settings...')
        console.log(chrome.storage.sync)
        chrome.storage.sync.get('enabledProviders', (result) => {
          const defaultProviders = AVAILABLE_PROVIDERS.map((p) => p.id)
          resolve({
            enabledProviders: result?.enabledProviders || defaultProviders,
          })
        })
      } catch (error) {
        console.error('Error loading settings:', error)
        resolve({
          enabledProviders: AVAILABLE_PROVIDERS.map((p) => p.id),
        })
      }
    })
  }

  private async saveSettings(settings: ProviderSettings): Promise<void> {
    return new Promise((resolve) => {
      console.log('Saving settings:', settings)
      try {
        chrome.storage.sync.set({ enabledProviders: settings.enabledProviders }, () => resolve())
      } catch (error) {
        console.error('Error saving settings:', error)
        resolve()
      }
    })
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault()

    const enabledProviders = Array.from(this.form.querySelectorAll('input[type="checkbox"]:checked')).map(
      (cb) => (cb as HTMLInputElement).value,
    )

    await this.saveSettings({ enabledProviders })
    this.showSaveNotification()
  }

  private async handleReset(e: Event): Promise<void> {
    e.preventDefault()

    await this.saveSettings(OptionsManager.DEFAULT_SETTINGS)
    await this.initializeForm()
    this.showResetNotification()
  }

  private showSaveNotification(): void {
    const notification = document.createElement('div')
    notification.className = 'notification success'
    notification.textContent = 'Proveedores actualizados correctamente'
    document.body.appendChild(notification)

    setTimeout(() => notification.remove(), 3000)
  }

  private showResetNotification(): void {
    const notification = document.createElement('div')
    notification.className = 'notification info'
    notification.textContent = 'Proveedores restaurados a valores predeterminados'
    document.body.appendChild(notification)

    setTimeout(() => notification.remove(), 3000)
  }
}

let manager: OptionsManager | null

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  manager = new OptionsManager()
})
