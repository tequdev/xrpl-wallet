import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { createContext } from 'react'

type WalletClientContext = {
  walletClient: WalletClient | null
  selectWallet: (adaptor: WalletAdaptor) => void
}

export const walletClientContext = createContext({} as WalletClientContext)
