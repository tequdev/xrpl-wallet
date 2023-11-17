import { useRef, useSyncExternalStore } from 'react'
import { useContext } from 'react'

import { walletClientContext } from '../context'

const useAccount = () => {
  const accountRef = useRef<string | null>(null)
  const { walletClient } = useContext(walletClientContext)
  const subscribe = (callback: () => void) => {
    walletClient?.getAddress().then((address) => {
      accountRef.current = address
      callback()
    })
    const unsubscribeDisconnected = walletClient?.onDisconnected(async () => {
      accountRef.current = null
      callback()
    })
    const unsubscribeConnected = walletClient?.onConnected(async () => {
      accountRef.current = await walletClient.getAddress()
      callback()
    })
    const unsubscribeAccountChange = walletClient?.onAccountChange((address) => {
      accountRef.current = address
      callback()
    })
    return () => {
      unsubscribeDisconnected && unsubscribeDisconnected()
      unsubscribeConnected && unsubscribeConnected()
      unsubscribeAccountChange && unsubscribeAccountChange()
    }
  }
  const account = useSyncExternalStore(
    subscribe,
    () => accountRef.current,
    () => null,
  )

  return account
}

export default useAccount
