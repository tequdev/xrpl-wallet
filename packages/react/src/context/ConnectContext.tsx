import { WalletAdaptor } from '@xrpl-wallet/core'
import { createContext } from 'react'
import { useState } from 'react'

type ConnectContext = {
  status: 'open' | 'close'
  open: () => void
  close: () => void
  adaptors: WalletAdaptor[]
}

export const connectContext = createContext({} as ConnectContext)

type ProviderProps = {
  adaptors: WalletAdaptor[]
  children: React.ReactNode
}

export const ConnectContextProvider = ({ children, adaptors }: ProviderProps) => {
  const [status, setStatus] = useState<ConnectContext['status']>('close')

  const open = () => {
    setStatus('open')
  }

  const close = () => {
    setStatus('close')
  }

  return <connectContext.Provider value={{ status, open, close, adaptors }}>{children}</connectContext.Provider>
}
