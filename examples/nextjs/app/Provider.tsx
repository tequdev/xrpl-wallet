'use client'
import { WalletAdaptor } from '@xrpl-wallet/core'
import { WalletClientContextProvider } from '@xrpl-wallet/react'

type Props<T extends WalletAdaptor = WalletAdaptor> = {
  adaptors: T[]
  children: React.ReactNode
}

export default function Provider({ adaptors, children }: Props) {
  return <WalletClientContextProvider adaptors={adaptors}>{children}</WalletClientContextProvider>
}
