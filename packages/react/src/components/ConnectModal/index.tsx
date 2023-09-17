import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { useContext, useEffect } from 'react'

import { walletClientContext } from '../../context'
import { connectContext } from '../../context/ConnectContext'
import { Dialog } from '../Dialog'

import style from './style.module.css'

export const ConnectModal = () => {
  const { adaptors, status, close } = useContext(connectContext)
  const { walletClient, setWalletClient } = useContext(walletClientContext)

  const connectWallet = async (adaptor: WalletAdaptor) => {
    setWalletClient(new WalletClient(adaptor))
  }

  useEffect(() => {
    const f = async () => {
      if (walletClient) {
        await walletClient.init()
        const address = await walletClient.getAddress()
        if (!address) {
          const result = await walletClient.signIn()
          if (!result) {
            setWalletClient(null)
          }
        }
      }
      close()
    }
    f()
  }, [walletClient])

  return status === 'open' ? (
    <Dialog>
      <div className={style['title-box']}>
        <div className={style['title']}>Connect With</div>
        <button className={style['close-btn']} onClick={() => close({ reset: true })}>
          <svg
            className={style['close-icon']}
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      </div>
      <div className={style['container']}>
        {adaptors.map((adaptor) => (
          <button key={adaptor.name} className={style['item']} onClick={() => connectWallet(adaptor)}>
            {adaptor.name}
          </button>
        ))}
      </div>
    </Dialog>
  ) : null
}
