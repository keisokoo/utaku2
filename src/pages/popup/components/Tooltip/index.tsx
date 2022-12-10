import TooltipStyle from './Tooltip.styles'
import { TooltipProps } from './Tooltip.types'

const Tooltip = ({ _css, children, ...props }: TooltipProps) => {
  return (
    <>
      {children && (
        <TooltipStyle.Wrap _css={_css} {...props}>
          {children}
        </TooltipStyle.Wrap>
      )}
    </>
  )
}
export default Tooltip
