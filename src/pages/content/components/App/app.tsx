import {
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { uniqBy } from 'remeda'
import { DownloadAbleType } from '../../types'
import ItemBox from '../ItemBox'
import { ImageItem, UtakuImageList } from './app.styled'

function getData(): Promise<chrome.webRequest.WebResponseHeadersDetails[]> {
  return new Promise((res) => {
    chrome.runtime.sendMessage(
      'get-user-data',
      (response: chrome.webRequest.WebResponseHeadersDetails[]) => {
        res(response ? response : [])
      }
    )
  })
}
function getUtakuDom(): HTMLDivElement {
  const utakuElement = document.querySelector('#utaku1209') as HTMLDivElement
  return utakuElement ?? null
}
export default function App() {
  const wrapRef = useRef() as MutableRefObject<HTMLDivElement>

  const [downloadAbleList, set_downloadAbleList] = useState<DownloadAbleType[]>(
    []
  )
  const [sizeLimit, set_sizeLimit] = useState({ width: 500, height: 500 })

  const [imageList, set_imageList] = useState<
    chrome.webRequest.WebResponseHeadersDetails[]
  >([])
  const timeoutRef = useRef() as MutableRefObject<NodeJS.Timeout>
  const poolingRef = useRef(false) as MutableRefObject<boolean>

  useEffect(() => {
    const getAvailable = () => {
      chrome.runtime.sendMessage('get-available')
    }
    getAvailable()
    document.addEventListener('visibilitychange', getAvailable)
    window.addEventListener('focus', getAvailable, false)
    return () => {
      document.removeEventListener('visibilitychange', getAvailable)
      window.removeEventListener('focus', getAvailable)
    }
  }, [])

  const runDataPool = useCallback(() => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(async () => {
      set_imageList(await getData())
      const utakuElement = getUtakuDom()
      if (poolingRef.current && utakuElement?.classList.contains('available')) {
        runDataPool()
      }
    }, 1000)
  }, [])

  const handleRemove = (item: chrome.webRequest.WebResponseHeadersDetails) => {
    set_imageList((prev) =>
      prev.filter((curr) => curr.requestId !== item.requestId)
    )
  }
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation()
      const utakuElement = wrapRef.current
      if (utakuElement) {
        if (utakuElement.classList.contains('active')) {
          poolingRef.current = false
          utakuElement.classList.remove('active')
        } else {
          utakuElement.classList.add('active')
          poolingRef.current = true
          runDataPool()
        }
      }
    },
    [runDataPool]
  )
  const handleOnLoad = (
    e: SyntheticEvent<HTMLImageElement, Event>,
    item: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    try {
      const imageTarget = e.target as EventTarget & HTMLImageElement
      if (imageTarget) {
        const visibleWithSize =
          sizeLimit.height <= imageTarget.naturalHeight &&
          sizeLimit.width <= imageTarget.naturalWidth
        set_downloadAbleList((prev) =>
          uniqBy(
            [
              ...prev,
              {
                id: item.requestId,
                tabId: item.tabId,
                url: item.url,
                width: imageTarget.naturalWidth,
                height: imageTarget.naturalHeight,
                active: false,
                visible: visibleWithSize,
                initiator: item.initiator,
                timeStamp: item.timeStamp,
              },
            ],
            (curr) => curr.url
          )
        )
      }
    } finally {
      handleRemove(item)
    }
  }
  const handleOnError = (
    e: SyntheticEvent<HTMLImageElement, Event>,
    item: chrome.webRequest.WebResponseHeadersDetails
  ) => {
    handleRemove(item)
  }
  const toggleActive = (id: string) => {
    set_downloadAbleList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    )
  }
  return (
    <UtakuImageList ref={wrapRef}>
      <div className="utaku-container">
        <div className="utaku-dispose-image">
          {imageList.map((item) => {
            return (
              <ImageItem
                key={item.requestId}
                src={item.url}
                alt={item.requestId}
                onLoad={(e) => handleOnLoad(e, item)}
                onError={(e) => handleOnError(e, item)}
              />
            )
          })}
        </div>
        <div className="utaku-grid">
          {downloadAbleList.map((item) => {
            return (
              <ItemBox
                key={item.id + item.url}
                item={item}
                handleActive={toggleActive}
              />
            )
          })}
        </div>
      </div>
      <div className="utaku-toggle" onClick={handleClick}></div>
    </UtakuImageList>
  )
}
