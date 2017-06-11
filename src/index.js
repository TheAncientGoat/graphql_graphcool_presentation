import React from 'react'
import ReactDOM from 'react-dom'

import {
  ApolloProvider,
  createNetworkInterface,
  ApolloClient,
} from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

import fetchSchema from 'fetch-graphql-schema'
import { buildSchema } from 'graphql'

import config from './config'
import DynamicPresentation from './containers/graphql_presentation'

const networkInterface = createNetworkInterface({
  uri: config.apiUri,
})

const wsClient = new SubscriptionClient(
  'ws://subscriptions.graph.cool/v1/cj3hbjrxco0eq0162v003otu4',
  { reconnect: true })

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

const client = new ApolloClient({ networkInterface: networkInterfaceWithSubscriptions })

window.codeCache = ''

window.schema = fetchSchema(config.apiUri, { readable: true })
window.schema.then((s) => {
  window.loadedSchema = buildSchema(s)
  ReactDOM.render(<ApolloProvider client={client}>
    <DynamicPresentation />
  </ApolloProvider>,
  document.getElementById('root'))
})
