import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import style from './style.module.css'

type DialogProps = {
  children: ReactNode
}

export const Dialog = ({ children }: DialogProps) => {
  return (
    <>
      {createPortal(
        <div className={style.bg}>
          <div className={style.dialog}>{children}</div>
        </div>,
        document.body,
      )}
    </>
  )
}
