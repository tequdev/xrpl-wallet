import { useContext } from 'react'

import { connectContext } from '../../context/ConnectContext'

export const ConnectButton = () => {
  const context = useContext(connectContext)

  return (
    <button onClick={context.open} disabled={context.status === 'open'}>
      Connect Wallet
    </button>
  )
}
