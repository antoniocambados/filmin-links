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

/**
 * Opciones para la función fetchAndCreateElement.
 */
interface FetchOptions {
  /** URL a la que se realizará la petición */
  url: string
  /** Método HTTP a utilizar (por defecto: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Cabeceras HTTP para la petición */
  headers?: Record<string, string>
  /** Cuerpo de la petición (para métodos POST, PUT) */
  body?: string | FormData
  /** Tipo de elemento HTML a crear (por defecto: div) */
  elementType?: string
  /** Clases CSS a añadir al elemento creado */
  classes?: string[]
  /** ID a asignar al elemento creado */
  id?: string
  /** Función a ejecutar antes de insertar el elemento */
  beforeInsert?: (element: HTMLElement) => void
  /** Función a ejecutar cuando ocurre un error */
  onError?: (error: Error) => void
  /** Tiempo máximo de espera en ms (por defecto: 10000) */
  timeout?: number
}

/**
 * Realiza una petición HTTP y crea un elemento DOM con el contenido HTML devuelto.
 *
 * Esta función permite cargar contenido dinámicamente y convertirlo en un elemento
 * insertable en el DOM. Soporta diferentes opciones de configuración como método HTTP,
 * cabeceras, callbacks, etc.
 *
 * @example
 * // Ejemplo básico:
 * fetchAndCreateElement({
 *   url: 'https://ejemplo.com/contenido',
 *   classes: ['mi-contenedor', 'contenido-dinámico']
 * }).then(element => {
 *   document.getElementById('contenedor').appendChild(element);
 * });
 *
 * @param options Opciones para la petición y la creación del elemento
 * @returns Promesa que resuelve al elemento creado con el contenido HTML
 */
export async function fetchAndCreateElement(options: FetchOptions): Promise<HTMLElement> {
  // Valores por defecto para las opciones
  const {
    url,
    method = 'GET',
    headers = {},
    body = undefined,
    elementType = 'div',
    classes = [],
    id = '',
    beforeInsert = null,
    onError = console.error,
    timeout = 10000,
  } = options

  try {
    // Crear un AbortController para el timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Configurar la petición
    const fetchOptions: RequestInit = {
      method,
      headers,
      body,
      signal: controller.signal,
    }

    // Realizar la petición
    const response = await fetch(url, fetchOptions)
    // Limpiar el timeout ya que la petición se completó
    clearTimeout(timeoutId)

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`)
    }

    // Obtener el contenido HTML
    const html = await response.text()

    // Crear el elemento contenedor
    const element = document.createElement(elementType)

    // Asignar ID si se proporcionó
    if (id) {
      element.id = id
    }

    // Añadir las clases
    if (classes.length > 0) {
      element.classList.add(...classes)
    }

    // Asignar el contenido HTML
    element.innerHTML = html

    // Ejecutar callback beforeInsert si existe
    if (beforeInsert && typeof beforeInsert === 'function') {
      beforeInsert(element)
    }

    return element
  } catch (error: Error | any) {
    // Manejar errores
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`La petición a ${url} excedió el tiempo de espera (${timeout}ms)`)
      onError(timeoutError)
      throw timeoutError
    }

    onError(error)
    throw error
  }
}
