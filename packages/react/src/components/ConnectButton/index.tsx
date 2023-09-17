import { useContext } from 'react'

import { connectContext } from '../../context/ConnectContext'

import style from './style.module.css'

export const ConnectButton = () => {
  const context = useContext(connectContext)

  return (
    <button className={style['connect-btn']} onClick={context.open} disabled={context.status === 'open'}>
      Connect Wallet
    </button>
  )
}
