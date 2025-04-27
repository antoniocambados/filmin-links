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

// Escuchar mensajes desde los scripts de contenido
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Verificar si es la acción para abrir opciones
  if (request.action === 'openOptions') {
    // Abrir la página de opciones
    chrome.runtime.openOptionsPage()
    // Informar al remitente que el mensaje se procesó correctamente
    sendResponse({ success: true })
    return true // Indica que manejaremos la respuesta de forma asíncrona
  }
  return false // No manejamos otros mensajes
})

// Mantener el service worker vivo en Chrome (necesario para escuchar eventos)
// No tiene efecto en Firefox, que mantiene el background script vivo de todas formas
const keepAlive = () => {
  chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(keepAlive)
  })
}
keepAlive()
