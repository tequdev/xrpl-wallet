import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { useState } from 'react'

import { walletClientContext } from './WalletClientContext'

type ProviderProps = {
  children: React.ReactNode
}

export const WalletClientContextProvider = ({ children }: ProviderProps) => {
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  const selectWallet = (adaptor: WalletAdaptor | null) => {
    if (adaptor === null) {
      setWalletClient(null)
    } else {
      setWalletClient(new WalletClient(adaptor))
    }
  }

  return <walletClientContext.Provider value={{ walletClient, selectWallet }}>{children}</walletClientContext.Provider>
}
