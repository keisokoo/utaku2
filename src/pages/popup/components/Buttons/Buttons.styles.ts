import { css, SerializedStyles } from '@emotion/react'
import styled from '@emotion/styled'
import { colors, typography } from '../../themes/styles'
import { AdditionalCss } from '../../themes/styles.type'
import { ButtonProps, ColorOption, DisabledType } from './Buttons.types'

const disableIcon = css`
  &:disabled {
    background: ${colors['Grayscale/Gray Lighter']};
    background-color: ${colors['Grayscale/Gray Lighter']};
    color: #ffffff;
    box-shadow: none;
    svg {
      path {
        fill: ${colors['Grayscale/Gray Default']};
      }
    }
    cursor: default;
  }
`
const disableFill = css`
  &:disabled {
    background: ${colors['Grayscale/Gray Lighter']};
    background-color: ${colors['Grayscale/Gray Lighter']};
    color: #ffffff;
    box-shadow: none;
    cursor: default;
  }
`
const disableText = css`
  &:disabled {
    background: transparent;
    background-color: transparent;
    color: ${colors['Grayscale/Gray Lighter']};
    box-shadow: none;
    cursor: default;
  }
`
const disabledStyles = {
  fill: disableFill,
  text: disableText,
  icon: disableIcon,
} as { [key in DisabledType]: SerializedStyles }

export const buttonAssets = (color: ColorOption, _css?: AdditionalCss) => css`
  ${color._mini
    ? typography['Body/Caption/Bold']
    : typography['Body/Small/Bold']}
  padding: 4px 12px;
  color: #ffffff;
  ${color.textColor ? `color: ${colors[color.textColor]};` : ''}
  ${color.iconColor
    ? css`path{
    fill ${colors[color.iconColor]};
  }`
    : ''}
  ${color.backgroundColor
    ? `background-color: ${colors[color.backgroundColor]};`
    : ''}
${color.borderColor
    ? `box-shadow: inset 0px 0px 0px 1px ${colors[color.borderColor]};`
    : ''}
transition: 0.3s ease-in-out;
  &:hover {
    ${color.hoverTextColor ? `color: ${colors[color.hoverTextColor]};` : ''}
    ${color.hoverIconColor
      ? css`path{
    fill ${colors[color.hoverIconColor]};
  }`
      : ''}
    ${color.hoverBackgroundColor
      ? `background-color: ${colors[color.hoverBackgroundColor]};`
      : ''}
${color.hoverBorderColor
      ? `box-shadow: inset 0px 0px 0px 1px ${colors[color.hoverBorderColor]}`
      : ''}
  }
  ${disabledStyles[color.disabledType]}
  ${_css ? _css : ''}
`

export const ButtonStyle = styled.button(
  (props: ButtonProps) => css`
    border: none;
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    ${props._css && props._css}
  `
)
export const CSVDownloadButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${colors['Success/Default']};
  transition: 0.3s;
  &:hover {
    background-color: ${colors['Success/Dark']};
  }
  &:disabled {
    background-color: ${colors['Grayscale/Gray Lighter']};
  }
`
