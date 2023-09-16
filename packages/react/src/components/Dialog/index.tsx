import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type DialogProps = {
  children: ReactNode
}

export const Dialog = ({ children }: DialogProps) => {
  return <>{createPortal(<div style={{ display: 'f', border: 'solid 2px black' }}>{children}</div>, document.body)}</>
}
