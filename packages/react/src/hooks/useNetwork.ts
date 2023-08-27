import { Network } from '@xrpl-wallet/core'
import { useRef, useSyncExternalStore } from 'react'
import { useContext } from 'react'

import { walletClientContext } from '../context'

const useNetwork = () => {
  const networkRef = useRef<Network | null>(null)
  const { walletClient } = useContext(walletClientContext)
  const subscribe = (callback: () => void) => {
    const unsubscribeNetworkChange = walletClient?.onNetworkChange((network) => {
      networkRef.current = network
      callback()
    })
    return () => {
      unsubscribeNetworkChange && unsubscribeNetworkChange()
    }
  }
  const network = useSyncExternalStore(
    subscribe,
    () => networkRef.current,
    () => null,
  )

  return network
}

export default useNetwork
