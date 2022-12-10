import styled from '@emotion/styled/macro'
import { colors, typography } from '@src/pages/popup/themes/styles'

const IconWrap = styled.i`
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  &:hover {
    color: ${colors['White/White off']};
  }
  svg: {
    width: 14px;
    height: 14px;
  }
`
const ImageSize = styled.div`
  ${typography['Body/Small/Regular']}
  padding: 2px 0 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
const ItemBoxStyles = {
  Wrap: styled.div`
    break-inside: avoid;
    box-sizing: border-box;
    opacity: 0.8;
    cursor: pointer;
    transition: ease-out 0.15s;
    margin-bottom: 1em;
    position: relative;
    &:hover {
      opacity: 1;
    }
    padding: 6px;
    color: ${colors['White/White 70%']};
    .image-box {
      font-size: 0;
    }
    &.active {
      opacity: 1;
      border-radius: 8px;
      background-color: ${colors['Accent/Light']};
      .check {
        position: absolute;
        top: 8px;
        left: 8px;
        font-size: 16px;
        color: #00bd1e;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #fff;
      }
      ${ImageSize} {
        color: ${colors['Accent/Dark']};
      }
      ${IconWrap} {
        color: ${colors['Accent/Dark']};
        &:hover {
          color: ${colors['White/White off']};
        }
      }
    }
  `,
  ImageSize,
  Icons: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    & > div {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
  IconWrap,
}
export default ItemBoxStyles
