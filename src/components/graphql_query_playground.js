import React from 'react'

import ReactJson from 'react-json-view'

import fetchSchema from 'fetch-graphql-schema'
import { buildSchema } from 'graphql'

import config from '../config'
import { rawMutation } from '../utils'

import HintableCodeMirror from './hintable_codemirror'

class GQLPlayground extends React.Component {

  constructor(props) {
    super()
    this.state = {
      queryResult: {},
      apiUri: props.endpoint || config.apiUri,
      schema: window.loadedSchema || props.schema,
      code: props.code || '',
    }
  }

  setSchema() {
    fetchSchema(this.state.apiUri, { readable: true })
    .then(s => this.setState({ schema: buildSchema(s) }))
  }

  mutate(mutation) {
    rawMutation(this.state.apiUri || config.apiUri, mutation)
      .then(queryResult => this.setState({ queryResult }))
  }

  render() {
    const { id } = this.props
    return (
      <div>
        <input
          style={{ width: '50vw' }}
          placeholder="GraphQL endpoint"
          value={this.state.apiUri}
          onChange={e => this.setState({ apiUri: e.target.value })}
        />
        <button onClick={() => this.setSchema()}>Update Endpoint URL</button>
        <div style={{ display: 'flex', flexBasis: 'fill', width: '100%', flexDirection: 'row' }}>
          <div style={{ flex: 1, maxWidth: '50vw' }}>
            <HintableCodeMirror schema={this.state.schema} code={this.state.code} id={id} />
          </div>

          <div style={{ flex: 1 }}>
            <ReactJson src={this.state.queryResult} />
          </div>
        </div>
        <button onClick={() => this.mutate(window.codeCache)}> Run Code </button>
      </div>
    )
  }
}

export default GQLPlayground
