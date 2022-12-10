import styled from '@emotion/styled/macro'
import { colors } from '../../themes/styles'
import { addCssProps } from '../../themes/styles.helper'

const ModalStyle = {
  Wrap: styled.div`
    position: relative;
    z-index: 11;
    background: #ffffff;
    border-radius: 20px;
    width: 312px;
    min-height: 200px;
    max-width: 312px;
    outline: none;
    ${addCssProps}
  `,
  Background: styled.div`
    z-index: 10;
    background-color: ${colors['ETC/Dim']};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  `,
}
export default ModalStyle
