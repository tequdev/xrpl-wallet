import { ProposalTypes } from '@walletconnect/types'

import { DEFAULT_XRPL_METHODS, DEFAULT_XRPL_EVENTS } from './constants'

const getNamespacesFromChains = (chains: string[]) => {
  const supportedNamespaces: string[] = []
  chains.forEach((chainId) => {
    const [namespace] = chainId.split(':')
    if (!supportedNamespaces.includes(namespace)) {
      supportedNamespaces.push(namespace)
    }
  })

  return supportedNamespaces
}

const getSupportedRequiredMethodsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'xrpl':
      return [DEFAULT_XRPL_METHODS.XRPL_SIGN_TRANSACTION]
    default:
      throw new Error(`No default methods for namespace: ${namespace}`)
  }
}

const getSupportedOptionalMethodsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'xrpl':
      return [DEFAULT_XRPL_METHODS.XRPL_SIGN_TRANSACTION, DEFAULT_XRPL_METHODS.XRPL_SIGN_TRANSACTION_FOR]
    default:
      throw new Error(`No default methods for namespace: ${namespace}`)
  }
}

const getSupportedEventsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'xrpl':
      return Object.values(DEFAULT_XRPL_EVENTS || {})
    default:
      throw new Error(`No default events for namespace: ${namespace}`)
  }
}

export const getRequiredNamespaces = (chains: string[]): ProposalTypes.RequiredNamespaces => {
  const selectedNamespaces = getNamespacesFromChains(chains)
  console.debug('selected required namespaces:', selectedNamespaces)

  return Object.fromEntries(
    selectedNamespaces.map((namespace) => [
      namespace,
      {
        methods: getSupportedRequiredMethodsByNamespace(namespace),
        chains: chains.filter((chain) => chain.startsWith(namespace)),
        events: getSupportedEventsByNamespace(namespace) as any[],
      },
    ]),
  )
}

export const getOptionalNamespaces = (chains: string[]): ProposalTypes.OptionalNamespaces => {
  const selectedNamespaces = getNamespacesFromChains(chains)
  console.debug('selected optional namespaces:', selectedNamespaces)

  return Object.fromEntries(
    selectedNamespaces.map((namespace) => [
      namespace,
      {
        methods: getSupportedOptionalMethodsByNamespace(namespace),
        chains: chains.filter((chain) => chain.startsWith(namespace)),
        events: getSupportedEventsByNamespace(namespace) as any[],
      },
    ]),
  )
}
