import styled from '@emotion/styled/macro'

export const UtakuImageList = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  height: 100vh;
  min-width: 300px;
  max-width: 50vw;
  width: 100%;
  padding: 0 16px;
  backdrop-filter: blur(6px);
  background-color: rgb(0 0 0 / 50%);
  transform: translateX(100%);
  transition: 0.3s;
  &.active {
    transform: translateX(0);
  }

  .utaku-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overscroll-behavior-y: contain;
  }
  .utaku-grid {
    column-count: 4;
    column-gap: 1%;
  }
  .utaku-grid > img {
    width: 100%;
    break-inside: avoid;
    box-sizing: border-box;
  }

  .utaku-toggle {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 15px 0 0 15px;
    backdrop-filter: blur(6px);
    background-color: rgb(190 190 190 / 50%);
    width: 30px;
    height: 30px;
    transform: translate(-30px, 0);
    cursor: pointer;
  }
  .utaku-dispose-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
    overflow: hidden;
    & > img {
      width: 1px;
      height: 1px;
    }
  }
`
export const ImageItem = styled.img`
  width: 100%;
  break-inside: avoid;
  box-sizing: border-box;
`
