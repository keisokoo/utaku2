import styled from '@emotion/styled/macro'
import { colors, typography } from '../../themes/styles'
import { addCssProps } from '../../themes/styles.helper'

const TooltipStyle = {
  Wrap: styled.div`
    background-color: ${colors['Warning/Light']};
    ${typography['Body/Caption/Bold']}
    color: ${colors['Grayscale/Gray Dark']};
    transform: translateY(calc(100% + 6px));
    padding: 6px 12px;
    position: absolute;
    ${addCssProps}
  `,
}

export default TooltipStyle
