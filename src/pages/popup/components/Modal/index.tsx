import React, { MutableRefObject, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import S from './Modal.styles'
import { ModalProps } from './Modal.types'

// src/index.scss 에 모달 css 포함
// public/index.html 에 <div id="modal"></div> 포함

const Modal = ({ open, onClose, children, ...props }: ModalProps) => {
  const wrapRef = useRef() as MutableRefObject<HTMLDivElement>
  const rootRef = useRef(
    document.querySelector('#root')!
  ) as MutableRefObject<HTMLDivElement>
  const bodyRef = useRef(document.body!) as MutableRefObject<HTMLDivElement>

  useEffect(() => {
    if (bodyRef.current && rootRef.current) {
      if (open) {
        bodyRef.current.classList.add('modal-visible')
        bodyRef.current.classList.remove('modal-hide')
        if (wrapRef.current) {
          wrapRef.current.focus()
        }
      } else {
        bodyRef.current.classList.remove('modal-visible')
        bodyRef.current.classList.add('modal-hide')
      }
    }
    return () => {
      document.body!.classList.remove('modal-visible')
      document.body!.classList.add('modal-hide')
    }
  }, [open])

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClose } as { onClose: () => void })
    }
    return child
  })
  return ReactDOM.createPortal(
    <>
      {open && (
        <>
          <S.Wrap tabIndex={0} ref={wrapRef} {...props}>
            {childrenWithProps}
          </S.Wrap>
          <S.Background
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          />
        </>
      )}
    </>,
    document.querySelector('#modal')!
  )
}
export default Modal
