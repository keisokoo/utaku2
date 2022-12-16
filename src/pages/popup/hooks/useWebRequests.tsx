import { useCallback, useEffect, useMemo, useState } from 'react'
import { equals, groupBy, uniqBy } from 'remeda'

interface TAB_LIST_TYPE extends chrome.tabs.Tab {
  tooltip?: string
}

const useWebRequests = (active = true) => {
  const [sourceList, set_sourceList] = useState<
    chrome.webRequest.WebResponseHeadersDetails[]
  >([])
  const [tabIdList, set_tabIdList] = useState<number[]>([])
  const [tabList, set_tabList] = useState<TAB_LIST_TYPE[]>([])
  const handleTooltip = (item: TAB_LIST_TYPE, tooltip: string) => {
    set_tabList((prev) =>
      prev.map((curr) => (curr.id === item.id ? { ...curr, tooltip } : curr))
    )
  }
  useEffect(() => {
    const updateOrCreateTab = (
      tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
      tab: TAB_LIST_TYPE
    ) => {
      set_tabList((prev) =>
        prev.some((tabItem) => tabItem.id === tab.id)
          ? prev.map((tabItem) => (tabItem.id === tab.id ? tab : tabItem))
          : [...prev, tab]
      )
    }
    const closeTab = (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
      set_tabList((prev) => prev.filter((tabItem) => tabItem.id !== tabId))
    }
    const activeTab = (activeInfo: chrome.tabs.TabActiveInfo) => {
      set_tabList((prev) =>
        prev.map((tabItem) =>
          tabItem.id === activeInfo.tabId
            ? { ...tabItem, active: true }
            : { ...tabItem, active: false }
        )
      )
    }
    const focusWindow = (windowId: number) => {
      if (windowId > 0) {
        chrome.tabs.query({ active: true, windowId }, (result) => {
          if (result[0] && result[0].id)
            set_tabList((prev) =>
              prev.map((tabItem) =>
                tabItem.id === result[0].id
                  ? { ...tabItem, active: true }
                  : { ...tabItem, active: false }
              )
            )
        })
      }
    }
    chrome.windows.onFocusChanged.addListener(focusWindow)
    chrome.tabs.onActivated.addListener(activeTab)
    chrome.tabs.onUpdated.addListener(updateOrCreateTab)
    chrome.tabs.onRemoved.addListener(closeTab)
    return () => {
      chrome.tabs.onUpdated.removeListener(updateOrCreateTab)
      chrome.tabs.onRemoved.removeListener(closeTab)
      chrome.tabs.onActivated.removeListener(activeTab)
      chrome.windows.onFocusChanged.removeListener(focusWindow)
    }
  }, [])
  const sourceGroup = useMemo(
    () => groupBy(sourceList, (curr) => curr.tabId),
    [sourceList]
  )

  useEffect(() => {
    console.log('sourceGroup', sourceGroup)
    const TabIdList = Object.keys(sourceGroup).map((keyName) => Number(keyName))
    set_tabIdList((prev) => (equals(prev, TabIdList) ? prev : TabIdList))
  }, [sourceGroup])

  const clearList = useCallback(() => {
    set_sourceList([])
  }, [])

  const handleSourceList = useCallback(
    (item: chrome.webRequest.WebResponseHeadersDetails[]) => {
      set_sourceList(item)
    },
    []
  )
  const handleRemove = useCallback((url: string) => {
    set_sourceList((prev) => prev.filter((curr) => curr.url !== url))
  }, [])

  useEffect(() => {
    function getCurrentResponse(
      req: chrome.webRequest.WebResponseHeadersDetails
    ) {
      if (req.type === 'image') {
        // chrome.runtime.sendMessage({ source: req })
        set_sourceList((prev) => uniqBy([...prev, req], (curr) => curr.url))
      }
    }
    const hasListener = chrome.webRequest.onHeadersReceived.hasListeners()
    if (active && !hasListener) {
      chrome.webRequest.onHeadersReceived.addListener(
        getCurrentResponse,
        {
          urls: ['<all_urls>'],
        },
        ['responseHeaders']
      )
    } else if (!active && hasListener) {
      chrome.webRequest.onHeadersReceived.removeListener(getCurrentResponse)
    }
  }, [active])

  return {
    sourceList,
    tabList,
    tabIdList,
    sourceGroup,
    handleTooltip,
    clearList,
    handleRemove,
    handleSourceList,
  }
}

export default useWebRequests
