import { WalletAdaptor } from '@xrpl-wallet/core'
import { createContext, useContext } from 'react'
import { useState } from 'react'

import { walletClientContext } from '.'

type ConnectContext = {
  status: 'open' | 'close'
  open: () => void
  close: (prop?: { reset: boolean }) => void
  adaptors: WalletAdaptor[]
}

// eslint-disable-next-line react-refresh/only-export-components
export const connectContext = createContext({} as ConnectContext)

type ProviderProps = {
  adaptors: WalletAdaptor[]
  children: React.ReactNode
}

export const ConnectContextProvider = ({ children, adaptors }: ProviderProps) => {
  const { setWalletClient } = useContext(walletClientContext)
  const [status, setStatus] = useState<ConnectContext['status']>('close')

  const open = () => {
    setStatus('open')
  }

  const close = (prop?: { reset: boolean }) => {
    if (prop?.reset === true) {
      setWalletClient(null)
    }
    setStatus('close')
  }

  return <connectContext.Provider value={{ status, open, close, adaptors }}>{children}</connectContext.Provider>
}
