import {
  DangerButton,
  GrayScaleFill,
  PrimaryButton,
  SecondaryButton,
  WhiteFill,
} from '@src/pages/popup/components/Buttons'
import {
  MutableRefObject,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaFileDownload,
  FaTrash,
} from 'react-icons/fa'
import { uniqBy } from 'remeda'
import { DownloadAbleType } from '../../types'
import ItemBox from '../ItemBox'
import {
  Center,
  Controller,
  Editor,
  ImageItem,
  Input,
  InputWrap,
  Left,
  Right,
  UtakuImageList,
} from './app.styled'

type chromeDownloadItem = chrome.webRequest.WebResponseHeadersDetails

function getData(): Promise<{
  list: chromeDownloadItem[]
  downloaded: string[]
}> {
  return new Promise((res) => {
    chrome.runtime.sendMessage(
      'get-user-data',
      (response: { list: chromeDownloadItem[]; downloaded: string[] }) => {
        res({ ...response })
        return false
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
  const [live, set_live] = useState<boolean>(true)
  const [folderName, set_folderName] = useState<string>('')
  // const [nameList, set_nameList] = useState<string[]>([])

  const [downloadedItem, set_downloadedItem] = useState<string[]>([])
  const [downloadAbleList, set_downloadAbleList] = useState<DownloadAbleType[]>(
    []
  )
  const [sizeLimit, set_sizeLimit] = useState({ width: 500, height: 500 })

  const [imageList, set_imageList] = useState<chromeDownloadItem[]>([])
  const timeoutRef = useRef() as MutableRefObject<NodeJS.Timeout>
  const poolingRef = useRef(false) as MutableRefObject<boolean>

  useEffect(() => {
    const getAvailable = () => {
      chrome.runtime.sendMessage('get-available', (response) => {
        if (response) {
          // const utaku1209 = document.querySelector('#utaku1209')
          // if (utaku1209) {
          //   utaku1209.classList.add('available')
          // }
        } else {
          const utaku1209 = document.querySelector('#utaku1209')
          if (utaku1209) {
            utaku1209.classList.remove('available')
          }
        }
        return true
      })
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
      const data = await getData()
      set_imageList(data.list)
      set_downloadedItem(data.downloaded)
      const utakuElement = getUtakuDom()
      if (poolingRef.current && utakuElement?.classList.contains('available')) {
        runDataPool()
      }
    }, 1000)
  }, [])

  const handleRemove = (item: chrome.webRequest.WebResponseHeadersDetails) => {
    set_imageList((prev) => {
      // prev.filter((curr) => curr.requestId !== item.requestId)
      if (prev[item.url]) delete prev[item.url]
      return prev
    })
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
          chrome.storage.sync.get(
            ['sizeLimit', 'folderName', 'replaceFilter', 'folderNameList'],
            (items) => {
              if (
                items.sizeLimit &&
                items.sizeLimit.width &&
                items.sizeLimit.height
              )
                set_sizeLimit(items.sizeLimit)
              if (items.folderName) set_folderName(items.folderName)
              // if (items.replaceFilter) set_replaceText(items.replaceFilter);
              // if (items.folderNameList) set_folderNameList(items.folderNameList);
            }
          )
        }
      }
    },
    [runDataPool]
  )
  const handleOnLoad = (
    e: SyntheticEvent<HTMLImageElement, Event>,
    item: chromeDownloadItem
  ) => {
    try {
      const imageTarget = e.target as EventTarget & HTMLImageElement
      if (imageTarget) {
        const visibleWithSize =
          sizeLimit.height <= imageTarget.naturalHeight &&
          sizeLimit.width <= imageTarget.naturalWidth
        const downloadItem = {
          id: item.requestId,
          tabId: item.tabId,
          url: item.url,
          width: imageTarget.naturalWidth,
          height: imageTarget.naturalHeight,
          active: false,
          visible: visibleWithSize,
          initiator: item.initiator,
          timeStamp: item.timeStamp,
        }
        set_downloadAbleList((prev) =>
          uniqBy([...prev, downloadItem], (curr) => curr.url)
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
    chrome.runtime.sendMessage({
      remove: [item.url],
    })
  }
  const toggleActive = (id: string) => {
    set_downloadAbleList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    )
  }
  const handleSelectAll = (active: boolean) => {
    set_downloadAbleList((prev) =>
      prev.map((item) =>
        sizeLimit.height <= item.height && sizeLimit.width <= item.width
          ? { ...item, active }
          : item
      )
    )
  }
  const visibleList = useMemo(() => {
    return downloadAbleList
      .filter((item) => {
        const visibleWithSize =
          sizeLimit.height <= item.height && sizeLimit.width <= item.width
        return visibleWithSize
      })
      .filter((item) => {
        return !downloadedItem.includes(item.url)
      })
  }, [downloadAbleList, sizeLimit, downloadedItem])

  const handleSelectedSourcesRemove = (active: boolean) => {
    set_downloadAbleList((prev) =>
      prev.filter((item) => item.active !== active)
    )
    chrome.runtime.sendMessage({
      remove: visibleList
        .filter((item) => item.active === active)
        .map((item) => item.url),
    })
  }
  const handleSelectedSourcesAll = () => {
    set_downloadAbleList([])
    chrome.runtime.sendMessage({
      remove: visibleList.map((item) => item.url),
    })
  }
  const selectedDownload = () => {
    chrome.runtime.sendMessage({
      download: visibleList
        .filter((item) => item.active)
        .map((item) => item.url),
    })
  }
  const allDownload = () => {
    chrome.runtime.sendMessage({
      download: visibleList.map((item) => item.url),
    })
  }
  useEffect(() => {
    const wheelHorizontal = (e: WheelEvent) => {
      const utakuBox = document.querySelector('#utaku-box')
      if (!utakuBox.classList.contains('bottom')) return
      const utakuContainer = document.querySelector('.utaku-container')
      const mouseTarget = e.target as HTMLElement
      if (
        utakuContainer &&
        mouseTarget &&
        utakuContainer.contains(mouseTarget)
      ) {
        utakuContainer.scrollLeft += e.deltaY
      }
    }
    window.addEventListener('wheel', wheelHorizontal)
    return () => {
      window.removeEventListener('wheel', wheelHorizontal)
    }
  }, [])
  return (
    <UtakuImageList id="utaku-box" ref={wrapRef} className="bottom">
      <Controller>
        <Left>
          <WhiteFill
            _mini
            onClick={(e) => {
              e.stopPropagation()
              handleSelectedSourcesAll()
            }}
          >
            <FaTrash /> All
          </WhiteFill>
          <WhiteFill
            _mini
            disabled={visibleList.every((item) => !item.active)}
            onClick={(e) => {
              e.stopPropagation()
              handleSelectedSourcesRemove(false)
            }}
          >
            <FaTrash />
            Deselected
          </WhiteFill>
          <WhiteFill
            _mini
            disabled={visibleList.every((item) => !item.active)}
            onClick={(e) => {
              e.stopPropagation()
              handleSelectedSourcesRemove(true)
            }}
          >
            <FaTrash />
            Selected
          </WhiteFill>
        </Left>
        <Center>
          <GrayScaleFill
            _mini
            disabled={visibleList.every((item) => !item.active)}
            onClick={(e) => {
              e.stopPropagation()
              handleSelectAll(false)
            }}
          >
            <FaCircle />
            All
          </GrayScaleFill>
          <GrayScaleFill
            _mini
            disabled={visibleList.every((item) => item.active)}
            onClick={(e) => {
              e.stopPropagation()
              handleSelectAll(true)
            }}
          >
            <FaCheckCircle />
            All
          </GrayScaleFill>
        </Center>
        <Right>
          <SecondaryButton
            _mini
            disabled={!visibleList.some((item) => item.active)}
            onClick={(e) => {
              e.stopPropagation()
              selectedDownload()
            }}
          >
            <FaFileDownload />
            Selected
          </SecondaryButton>
          <PrimaryButton
            _mini
            onClick={(e) => {
              e.stopPropagation()
              allDownload()
            }}
          >
            <FaFileDownload />
            All
          </PrimaryButton>
        </Right>
      </Controller>
      <Editor>
        <Left>
          <InputWrap>
            <span>Folder:</span>
            <Input
              value={folderName}
              onChange={(e) => {
                set_folderName(e.target.value)
                chrome.runtime.sendMessage({ folderName: e.target.value })
              }}
            />
          </InputWrap>
          <InputWrap>
            <span>width:</span>
            <Input
              type={'number'}
              min={1}
              value={sizeLimit.width}
              onChange={(e) => {
                set_sizeLimit((prev) => ({
                  ...prev,
                  width: Number(e.target.value),
                }))
                chrome.storage.sync.set({
                  sizeLimit: { ...sizeLimit, width: Number(e.target.value) },
                })
              }}
            />
            <span>height:</span>
            <Input
              type={'number'}
              min={1}
              value={sizeLimit.height}
              onChange={(e) => {
                set_sizeLimit((prev) => ({
                  ...prev,
                  height: Number(e.target.value),
                }))
                chrome.storage.sync.set({
                  sizeLimit: { ...sizeLimit, height: Number(e.target.value) },
                })
              }}
            />
          </InputWrap>
        </Left>
        <Right>
          <div>
            {'( '}
            <span>
              {visibleList.filter((item) => item.active).length}
              {' / '}
              {visibleList.length}
            </span>
            {' )'}
          </div>
          {live && (
            <DangerButton
              _mini
              onClick={() => {
                set_live(false)
                poolingRef.current = false
              }}
            >
              Live
            </DangerButton>
          )}
          {!live && (
            <GrayScaleFill
              _mini
              onClick={() => {
                set_live(true)
                poolingRef.current = true
                runDataPool()
              }}
            >
              Live
            </GrayScaleFill>
          )}
        </Right>
      </Editor>
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
          {visibleList.map((item) => {
            return (
              <ItemBox
                downloaded={item.downloaded}
                key={item.id + item.url}
                item={item}
                handleActive={toggleActive}
              />
            )
          })}
        </div>
      </div>
      <div className="utaku-toggle" onClick={handleClick}>
        <FaChevronRight className="active" />
        <FaChevronLeft className="in-active" />
      </div>
    </UtakuImageList>
  )
}
