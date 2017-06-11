import React from 'react'
import { ContentSlide, Step } from 'react-presents'

import ReactJson from 'react-json-view'

import { rawMutation } from '../utils'
import HintableCodeMirror from './hintable_codemirror'
import config from '../config'

class DynamicSlide extends React.Component {
  constructor() {
    super()
    this.state = { queryResult: {} }
  }

  mutate(mutation) {
    rawMutation(this.state.apiUri || config.apiUri, mutation)
      .then(queryResult => this.setState({ queryResult }))
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
           </div>
         </div> : ''}
        <button onClick={() => this.mutate(window.codeCache)}> Run Code </button>
      </ContentSlide>
    )
  }
}

export default DynamicSlide
