import { AdditionalCss, DivAttributes } from '../../themes/styles.type'

export interface ModalProps extends DivAttributes {
  onClose: () => void
  open: boolean
  _css?: AdditionalCss
}
