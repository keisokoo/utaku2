import reloadOnUpdate from 'virtual:reload-on-update-in-background-script'

reloadOnUpdate('pages/background')
console.log('background loaded!4')

const checkPopup = (callBack: (tabId?: number) => void) => {
  chrome.tabs.query(
    { url: chrome.runtime.getURL('src/pages/popup/index.html') },
    (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        const tabId = tabs[0].id
        callBack(tabId)
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
  if (request === 'get-available') {
    let checkTabId = sender?.tab?.id
    checkPopup((popupTabId) => {
      if (popupTabId && checkTabId) {
        chrome.runtime.sendMessage({ checkTabId })
      } else {
      }
    })
  }
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
