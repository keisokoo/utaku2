import classNames from 'classnames'
import { useEffect } from 'react'
import { PrimaryButton, WhiteFill } from './components/Buttons'
import Tooltip from './components/Tooltip'
import useFileDownload from './hooks/useFileDownload'
import useWebRequests from './hooks/useWebRequests'
import PopupStyle from './Popup.styled'

const focusPopup = () => {
  chrome.tabs.query(
    { url: chrome.runtime.getURL('src/pages/popup/index.html') },
    (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        const tabId = tabs[0].id
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError.message)
          } else {
            chrome.windows.update(tab.windowId, { focused: true }, (win) => {
              chrome.tabs.update(tabId, { active: true })
            })
          }
        })
      }
    }
  )
}
const Popup = () => {
  const {
    sourceList,
    tabList,
    tabIdList,
    sourceGroup,
    handleTooltip,
    clearList,
    handleRemove,
  } = useWebRequests()
  const { folderName, downloadedItem, handleFolderName } = useFileDownload()

  useEffect(() => {
    chrome.storage.sync.get(
      ['sizeLimit', 'folderName', 'replaceFilter', 'folderNameList'],
      (items) => {
        if (items.folderName) handleFolderName(items.folderName)
      }
    )
    chrome.runtime.connect({ name: 'popup' })
  }, [])
  useEffect(() => {
    const setAvailable = (available?: boolean) => {
      const utaku1209 = document.querySelector('#utaku1209')
      if (utaku1209) {
        if (available) {
          utaku1209.classList.add('available')
        } else {
          utaku1209.classList.remove('available')
        }
      }
    }
    const available = (tabId?: number) => {
      if (tabId) {
        const bool = Boolean(
          sourceGroup &&
            tabId &&
            sourceGroup[tabId] &&
            sourceGroup[tabId].length > 0
        )
        chrome.tabs.get(tabId, (tabs) => {
          if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
          } else {
            chrome.scripting.executeScript({
              target: { tabId },
              func: setAvailable,
              args: [bool],
            })
          }
        })
      }
    }
    const onMessage = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: any,
      sender: chrome.runtime.MessageSender,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sendResponse: (response?: any) => void
    ) => {
      if (request === 'get-user-data') {
        if (sourceGroup?.[sender?.tab?.id]) {
          const data = sourceGroup[sender.tab.id]
          sendResponse({ list: data, downloaded: downloadedItem })
        }
      }
      if (request.checkTabId) {
        available(request.checkTabId)
      }
      if (request.download) {
        focusPopup()
        if (typeof request.download === 'string') {
          handleRemove(request.download)
          chrome.downloads.download({ url: request.download })
        }
        if (Array.isArray(request.download) && request.download.length > 0) {
          for (let i = 0; i < request.download.length; i++) {
            handleRemove(request.download[i])
            chrome.downloads.download({ url: request.download[i] })
          }
        }
      }
      if (request.remove) {
        ;(request.remove as string[]).forEach((url) => {
          handleRemove(url)
        })
      }
      if (request.folderName) {
        handleFolderName(request.folderName)
        chrome.storage.sync.set({ folderName: request.folderName })
      }
    }

    if (!chrome.runtime.onMessage.hasListener(onMessage)) {
      chrome.runtime.onMessage.addListener(onMessage)
    }
    return () => {
      if (chrome.runtime.onMessage.hasListener(onMessage)) {
        chrome.runtime.onMessage.removeListener(onMessage)
      }
    }
  }, [sourceGroup, downloadedItem])
  const handleClickTab = (tabId: number) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message)
      } else {
        chrome.windows.update(tab.windowId, { focused: true }, (win) => {
          chrome.tabs.update(tabId, { active: true })
        })
      }
    })
  }

  const handleReloadTab = (tabId: number) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message)
    } else {
      chrome.tabs.reload(tabId)
    }
  }

  return (
    <PopupStyle.Wrap className="App">
      {tabList.map((tabItem) => {
        return (
          <PopupStyle.Item
            key={tabItem.id}
            className={classNames({ active: tabItem.active })}
          >
            {tabItem.tooltip && <Tooltip>{tabItem.tooltip}</Tooltip>}
            <PopupStyle.Row
              className="description"
              onMouseEnter={(e) => {
                const targetText = e.currentTarget
                handleTooltip(
                  tabItem,
                  targetText ? targetText.innerText.replaceAll(/\n/g, '') : ''
                )
              }}
              onMouseLeave={() => {
                handleTooltip(tabItem, '')
              }}
            >
              <span className="title">{tabItem.title}</span>::
              <span className="url">{tabItem.url}</span>
              <span className="id">[{tabItem.id}]</span>
              <span className="length">
                ({sourceGroup[tabItem.id]?.length ?? 0})
              </span>
            </PopupStyle.Row>
            <PopupStyle.Row>
              <PrimaryButton
                onClick={(e) => {
                  e.stopPropagation()
                  handleClickTab(tabItem.id)
                }}
              >
                선택
              </PrimaryButton>
              <WhiteFill
                onClick={(e) => {
                  e.stopPropagation()
                  handleReloadTab(tabItem.id)
                }}
              >
                새로고침
              </WhiteFill>
            </PopupStyle.Row>
          </PopupStyle.Item>
        )
      })}
    </PopupStyle.Wrap>
  )
}

export default Popup
