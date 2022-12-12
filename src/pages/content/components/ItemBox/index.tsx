import classNames from 'classnames'
import { FaCheck, FaClipboard, FaDownload, FaShare } from 'react-icons/fa'
import { DownloadAbleType } from '../../types'
import { ImageItem } from '../App/app.styled'
import S from './ItemBox.styles'

interface ItemBoxProps {
  item: DownloadAbleType
  handleActive: (id: string) => void
}
const ItemBox = ({ item, handleActive, ...props }: ItemBoxProps) => {
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then()
      return
    }
  }
  const handleDown = (url: string) => {
    chrome.runtime.sendMessage({ download: url })
  }
  const handleNewWindow = (url: string | URL) => {
    window.open(url, '_blank')
  }
  return (
    <>
      {item.visible && (
        <S.Wrap
          className={classNames({ active: item.active })}
          onClick={() => handleActive(item.id)}
        >
          <div className="image-box">
            {item.active && (
              <i className="check">
                <FaCheck />
              </i>
            )}
            <ImageItem key={item.id} src={item.url} alt={item.id} />
          </div>
          <S.ImageSize className="image-size">
            <span>width: {item.width}px</span>
            <span>height: {item.height}px</span>
          </S.ImageSize>
          <S.Icons className="image-icons">
            <div>
              <S.IconWrap
                onClick={(e) => {
                  e.stopPropagation()
                  copyToClipboard(item.url)
                }}
              >
                <FaClipboard />
              </S.IconWrap>
              <S.IconWrap
                onClick={(e) => {
                  e.stopPropagation()
                  handleDown(item.url)
                }}
              >
                <FaDownload />
              </S.IconWrap>
            </div>
            <S.IconWrap
              onClick={(e) => {
                e.stopPropagation()
                handleNewWindow(item.url)
              }}
            >
              <FaShare />
            </S.IconWrap>
          </S.Icons>
        </S.Wrap>
      )}
    </>
  )
}
export default ItemBox
