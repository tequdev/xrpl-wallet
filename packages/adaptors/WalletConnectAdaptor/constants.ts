export const DEFAULT_LOGGER = process.env.NODE_ENV === 'production' ? 'error' : 'debug'

/**
 * XRPL
 */
export enum DEFAULT_XRPL_METHODS {
  XRPL_SIGN_TRANSACTION = 'xrpl_signTransaction',
  XRPL_SIGN_TRANSACTION_FOR = 'xrpl_signTransactionFor',
}

export enum DEFAULT_XRPL_EVENTS {}
