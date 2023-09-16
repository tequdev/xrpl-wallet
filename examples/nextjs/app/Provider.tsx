'use client'
import { WalletAdaptor } from '@xrpl-wallet/core'
import { WalletClientContextProvider } from '@xrpl-wallet/react'

type Props<T extends WalletAdaptor = WalletAdaptor> = {
  adaptors: T[]
  metadata: { adaptor: T['name']; props?: any }[]
  children: React.ReactNode
}

export default function Provider({ adaptors, metadata, children }: Props) {
  return (
    <WalletClientContextProvider adaptors={adaptors} metadata={metadata}>
      {children}
    </WalletClientContextProvider>
  )
}
