import reloadOnUpdate from 'virtual:reload-on-update-in-background-script'

reloadOnUpdate('pages/background')
let popupIsOn = false
console.log('background loaded!5')
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === 'popup') {
    popupIsOn = true
    console.log('popup has been opened!')
    port.onDisconnect.addListener(function () {
      console.log('popup has been closed')
      popupIsOn = false
    })
  }
})
const checkPopup = (callBack: (tabId?: number) => void) => {
  console.log('popupIsOn', popupIsOn)
  if (popupIsOn) {
    callBack()
  }
  chrome.tabs.query(
    { url: chrome.runtime.getURL('src/pages/popup/index.html') },
    (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        const tabId = tabs[0].id
        chrome.tabs.get(tabId, (tabs) => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message)
          } else {
            callBack(tabId)
          }
        })
      } else {
        return callBack()
      }
    }
  )
}
const onMessage = (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  console.log('request', request)
  if (request === 'get-available') {
    let checkTabId = sender?.tab?.id
    if (popupIsOn) {
      sendResponse(true)
      chrome.runtime.sendMessage({ checkTabId })
    } else {
      sendResponse(false)
    }
  }
  return true
}

if (!chrome.runtime.onMessage.hasListener(onMessage)) {
  chrome.runtime.onMessage.addListener(onMessage)
}
function createWindow(tab: chrome.tabs.Tab) {
  chrome.tabs.query(
    { url: chrome.runtime.getURL('src/pages/popup/index.html') },
    (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        const tabId = tabs[0].id
        chrome.tabs.get(tabId, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true }, (win) => {
            chrome.tabs.update(tabId, { active: true })
          })
        })
      } else {
        chrome.windows.create({
          type: 'popup',
          url: chrome.runtime.getURL('src/pages/popup/index.html'),
          focused: true,
          width: 1024,
          height: 768,
        })
      }
    }
  )
}
chrome.action.onClicked.addListener(createWindow)
