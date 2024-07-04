import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { createContext, useEffect } from 'react'
import { useState } from 'react'

import { ConnectModal } from '../components/ConnectModal'

import { ConnectContextProvider } from './ConnectContext'

type WalletClientContext = {
  walletClient: WalletClient | null
  setWalletClient: (walletClient: WalletClient | null) => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const walletClientContext = createContext({} as WalletClientContext)

type ProviderProps<T extends WalletAdaptor = WalletAdaptor> = {
  children: React.ReactNode
  adaptors: T[]
}

export const WalletClientContextProvider = ({ children, adaptors }: ProviderProps) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  useEffect(() => {
    const promises = adaptors.map(async (adaptor) => {
      await adaptor.init()
      return (await adaptor.getAddress()) ? Promise.resolve(adaptor) : Promise.reject(null)
    })
    if (promises.length === 0) return
    Promise.any(promises).then((adaptor) => {
      if (adaptor) {
        setWalletClient(new WalletClient(adaptor))
      }
    })
  }, [adaptors])

  return (
    <walletClientContext.Provider value={{ walletClient, setWalletClient }}>
      <ConnectContextProvider adaptors={adaptors}>
        {children}
        <ConnectModal />
      </ConnectContextProvider>
    </walletClientContext.Provider>
  )
}
