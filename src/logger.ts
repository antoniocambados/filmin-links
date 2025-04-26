/**
 * Clase para gestionar logs en la consola con un formato personalizado
 * para la extensión FilminLinks.
 */
export default class Logger {
  private static readonly PREFIX: string = 'FilminLinks'
  private static readonly PREFIX_COLOR: string = '#ec7445'

  /**
   * Niveles de log disponibles
   */
  private static readonly LEVELS = {
    log: {
      emoji: '📝',
      style: 'color: #333; font-weight: normal',
      method: 'log',
    },
    info: {
      emoji: 'ℹ️',
      style: 'color: #0080ff; font-weight: normal',
      method: 'info',
    },
    debug: {
      emoji: '🔍',
      style: 'color: #9933cc; font-weight: normal',
      method: 'debug',
    },
    success: {
      emoji: '✅',
      style: 'color: #00cc66; font-weight: normal',
      method: 'log',
    },
    warn: {
      emoji: '⚠️',
      style: 'color: #ffcc00; font-weight: bold',
      method: 'warn',
    },
    error: {
      emoji: '❌',
      style: 'color: #ff3333; font-weight: bold',
      method: 'error',
    },
  }

  /**
   * Formatea y muestra un mensaje en la consola con el estilo correspondiente al nivel especificado
   */
  private static logMessage(level: keyof typeof Logger.LEVELS, ...args: any[]): void {
    const { emoji, style, method } = Logger.LEVELS[level]

    // Primer parámetro: texto con formato
    const formattedPrefix = `%c${emoji} %c${Logger.PREFIX}%c`

    // Estilos para cada parte del prefijo
    const prefixStyle = `font-weight: bold; color: ${Logger.PREFIX_COLOR}`
    const restStyle = style

    // Añadir un espacio después del prefijo si hay argumentos
    const separator = args.length > 0 ? ' ' : ''

    // Log en consola con el formato y estilos apropiados
    // @ts-ignore
    console[method](
      `${formattedPrefix}${separator}`,
      'font-weight: normal;', // Estilo para el emoji
      prefixStyle, // Estilo para el prefijo FilminLinks
      restStyle, // Estilo para el resto del mensaje
      ...args, // Resto de argumentos
    )
  }

  /**
   * Registra un mensaje informativo general
   */
  public static log(...args: any[]): void {
    this.logMessage('log', ...args)
  }

  /**
   * Registra información relevante
   */
  public static info(...args: any[]): void {
    this.logMessage('info', ...args)
  }

  /**
   * Registra mensajes de depuración
   */
  public static debug(...args: any[]): void {
    this.logMessage('debug', ...args)
  }

  /**
   * Registra operaciones exitosas
   */
  public static success(...args: any[]): void {
    this.logMessage('success', ...args)
  }

  /**
   * Registra advertencias
   */
  public static warn(...args: any[]): void {
    this.logMessage('warn', ...args)
  }

  /**
   * Registra errores
   */
  public static error(...args: any[]): void {
    this.logMessage('error', ...args)
  }

  /**
   * Registra un objeto formateado para mejor visualización
   */
  public static object(obj: any, message: string = 'Objeto'): void {
    this.log(`${message}:`)
    console.log(obj)
  }

  /**
   * Registra el tiempo de ejecución de una función
   */
  public static time(label: string, fn: () => any): any {
    console.time(`${Logger.PREFIX}: ${label}`)
    const result = fn()
    console.timeEnd(`${Logger.PREFIX}: ${label}`)
    return result
  }

  /**
   * Registra un grupo de mensajes
   */
  public static group(groupName: string, fn: () => void): void {
    const formattedPrefix = `%c${Logger.PREFIX} - ${groupName}`
    const prefixStyle = `font-weight: bold; color: ${Logger.PREFIX_COLOR}`

    console.groupCollapsed(formattedPrefix, prefixStyle)
    fn()
    console.groupEnd()
  }
}
