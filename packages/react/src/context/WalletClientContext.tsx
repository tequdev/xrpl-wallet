import { createContext } from "react";
import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'

type WalletClientContext = {
  walletClient: WalletClient | null
  selectWallet: (adaptor: WalletAdaptor) => void
}

export const walletClientContext = createContext({} as WalletClientContext)
