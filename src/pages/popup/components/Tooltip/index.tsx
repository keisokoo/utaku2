import TooltipStyle from './Tooltip.styles'
import { TooltipProps } from './Tooltip.types'

const Tooltip = ({ _css, ...props }: TooltipProps) => {
  return (
    <>
      <TooltipStyle.Wrap _css={_css} {...props}></TooltipStyle.Wrap>
    </>
  )
}
export default Tooltip
