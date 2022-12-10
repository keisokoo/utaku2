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
          chrome.windows.update(tab.windowId, { focused: true }, (win) => {
            chrome.tabs.update(tabId, { active: true })
          })
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
  const {} = useFileDownload()
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
        chrome.scripting.executeScript({
          target: { tabId },
          func: setAvailable,
          args: [bool],
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
        if (sourceGroup[sender?.tab?.id]) {
          sendResponse(sourceGroup[sender.tab.id])
        }
      }
      if (request === 'get-available') {
        available(sender?.tab?.id)
      }
      if (request.download) {
        focusPopup()
        chrome.downloads.download({ url: request.download })
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
  }, [sourceGroup])
  const handleClickTab = (tabId: number) => {
    chrome.tabs.get(tabId, (tab) => {
      chrome.windows.update(tab.windowId, { focused: true }, (win) => {
        chrome.tabs.update(tabId, { active: true })
      })
    })
  }

  const handleReloadTab = (tabId: number) => {
    chrome.tabs.reload(tabId)
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
