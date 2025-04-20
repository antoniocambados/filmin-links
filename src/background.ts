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
