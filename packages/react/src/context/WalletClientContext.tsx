import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { createContext } from 'react'
import { useState } from 'react'

import { ConnectModal } from '../components/ConnectModal'

import { ConnectContextProvider } from './ConnectContext'

type WalletClientContext = {
  walletClient: WalletClient | null
  setWalletClient: (walletClient: WalletClient | null) => void
}

export const walletClientContext = createContext({} as WalletClientContext)

type ProviderProps<T extends WalletAdaptor = WalletAdaptor> = {
  children: React.ReactNode
  adaptors: T[]
  metadata: { adaptor: T['name']; props?: any }[]
}

export const WalletClientContextProvider = ({ children, adaptors }: ProviderProps) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  return (
    <walletClientContext.Provider value={{ walletClient, setWalletClient }}>
      <ConnectContextProvider adaptors={adaptors}>
        {children}
        <ConnectModal />
      </ConnectContextProvider>
    </walletClientContext.Provider>
  )
}
