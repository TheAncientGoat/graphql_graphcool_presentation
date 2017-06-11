import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'

import {
  ApolloProvider,
  createNetworkInterface,
  ApolloClient,
  gql,
  graphql,
} from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'

import { Presentation, ContentSlide, Slide, Step } from 'react-presents'

import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/hint/show-hint.css' // without this css hints won't show
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/lint/lint'
import 'codemirror-graphql/hint'
import 'codemirror-graphql/lint'
import 'codemirror-graphql/mode'

import ReactJson from 'react-json-view'

import fetchSchema from 'fetch-graphql-schema'
import { buildSchema } from 'graphql'

const apiUri = 'https://api.graph.cool/simple/v1/cj3hbjrxco0eq0162v003otu4'

const networkInterface = createNetworkInterface({
  uri: apiUri,
})

const wsClient = new SubscriptionClient(
  'ws://subscriptions.graph.cool/v1/cj3hbjrxco0eq0162v003otu4',
  { reconnect: true })

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

const client = new ApolloClient({ networkInterface: networkInterfaceWithSubscriptions })

const upsert = (arr, key, newval) => {
  const match = _.find(arr, key)
  if (match) {
    const index = _.indexOf(arr, _.find(arr, key))
    arr.splice(index, 1, newval)
  } else {
    arr.push(newval)
  }
}

window.codeCache = ''

const slideMutation = gql`
mutation editCode($id: ID!, $code: String!){
  updateSlide(
    id: $id
    code: $code
  ){
    id
  }
}
`

const MutationButton = graphql(slideMutation)(
  ({ mutate }) => (
    <button
      onClick={
        () => mutate(
          { variables: { id: window.editedSlide, code: window.codeCache } })}
    >
      Save Code
    </button>
  ),
)

const jsonHeaders = new Headers()
jsonHeaders.append('Content-Type', 'application/json')

const rawMutation = mutation =>
  fetch(apiUri, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: new Blob([JSON.stringify({"query": mutation.replace(/\n/g, '')})], { type: 'application/json' }),
  })
.then(r => r.json())
//.then(r => r.text())
//.then(r => r.replace(/,/g, ',\n'))

class HintableCodeMirror extends React.Component {
  autoComplete = (cm)=> {
    const codeMirror = this.codeMirror.getCodeMirrorInstance()
    // hint options for specific plugin & general show-hint

    // Other general hint config, like 'completeSingle' and 'completeOnSingleClick'
    // should be specified here and will be honored
    const hintOptions = {
      schema: window.loadedSchema,
    }

    // codeMirror.hint.sql is defined when importing codemirror/addon/hint/sql-hint
    // (this is mentioned in codemirror addon documentation)
    // Reference the hint function imported here when including other hint addons
    // or supply your own
    codeMirror.showHint(cm, codeMirror.hint.sql, hintOptions)
  }

  render() {
    const { id, code } = this.props
    return (
      <CodeMirror
        ref={(cm) => { this.codeMirror = cm }}
        options={{
          mode: 'graphql',
          theme: 'dracula',
          extraKeys: { 'Ctrl-Space': this.autoComplete },
        }}
        onChange={(x) => { window.codeCache = x; window.editedSlide = id }}
        value={code}
      />
    )
  }
}

class DynamicSlide extends React.Component {
  constructor() {
    super()
    this.state = { queryResult: {} }
  }

  mutate(mutation) {
    rawMutation(mutation).then(queryResult => this.setState({ queryResult }))
  }

  render() {
    const { id, title, code, content, image, steps = [] } = this.props
    return (
      <ContentSlide>
        <h1>{title}</h1>
        {image ? <img src={image} alt={title} /> : ''}
        {content}
        {steps ?
         steps.map((step, i) => <Step index={i} key={`${step}`}><li>{step}</li></Step>) : ''}
        {code
         ? <div style={{ display: 'flex', flexBasis: 'fill', width: '100%', flexDirection: 'row' }}>
           <div style={{ flex: 1 }}>
             <HintableCodeMirror code={code} id={id} />
           </div>

           <div style={{ flex: 1 }}>
            <ReactJson src={this.state.queryResult} />
             {/*<CodeMirror
               style={{ flex: 1 }}
               value={this.state.queryResult}
               options={{ mode: 'javascript', theme: 'dracula' }}
             />*/}
           </div>
         </div> : ''}
        <MutationButton />
        <button onClick={() => this.mutate(window.codeCache)}> Run Code </button>
      </ContentSlide>)
  }
}

const presentationSubscription = gql`
subscription createSlide {
  Slide(
    filter: { OR: [
      {
        mutation_in: [CREATED]
      },
      {
        mutation_in: [UPDATED]
      }
    ]}
  ) {
    mutation
    node {
      id
      title
      content
      steps
      code
      image
    }
  }
}
`

const DynamicPresentation = (props) => {
  if (props.data.loading) { return <h1> Loading </h1> }
  props.data.subscribeToMore({
    document: presentationSubscription,
    updateQuery: (previousState, { subscriptionData: { data: { Slide: { node, mutation } } } }) => (
      { allSlides: mutation === 'CREATED'
                 ? [...previousState.allSlides, node]
                 : upsert(previousState.allSlides, 'id', node) }),
  })
  return (
    <div>
      <Presentation>
        {props.data.allSlides.map(slide =>
          <Slide render={() => <DynamicSlide {...slide} />} key={slide.id} />)}
      </Presentation>
    </div>
  )
}


const presentationQuery = gql`query allSlides{
allSlides(orderBy: createdAt_ASC) {
  id
  title
  content
  steps
  code
  image
  }
}
`

/*
const opts = {
  props: props => (
    {
      name: 'allSlides',
      subscribeToMore: () =>
        props.allSlides.subscribeToMore({
          document: presentationSubscription,
          updateQuery: (prev, { subscriptionData }) => {
            if (!subscriptionData.data) {
              return prev
            }
            const newFeedItem = subscriptionData.data.slideAdded
            return Object.assign({}, prev, {
              entry: {
                slides: [newFeedItem, ...prev.entry.slides],
              },
            })
          },
        })
      ,
    }
  ),
}
*/

const ConnectedDynamicPresentation = graphql(presentationQuery)(DynamicPresentation)

window.schema = fetchSchema(apiUri, { readable: true })
window.schema.then((s) => {
  window.loadedSchema = buildSchema(s)
  ReactDOM.render(<ApolloProvider client={client}>
    <ConnectedDynamicPresentation />
  </ApolloProvider>,
  document.getElementById('root'))
})
