'use client'
import { WalletClientContextProvider } from '@xrpl-wallet/react'

export default function Provider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletClientContextProvider>
      {children}
    </WalletClientContextProvider>
  )
}
