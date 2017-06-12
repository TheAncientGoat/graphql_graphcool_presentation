import React from 'react'

import {
gql,
graphql,
} from 'react-apollo'

import GQLPlayground from '../components/graphql_query_playground'

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
  )
)

class SlideEditor extends React.Component {
  constructor() {
    super()
    this.state = {
      open: false,
    }

    this.openEditor = this.openEditor.bind(this)
    this.closeEditor = this.closeEditor.bind(this)
  }

  openEditor() {
    this.setState({ open: true })
  }

  closeEditor() {
    this.setState({ open: false })
  }

  generatedMutation() {
    const { props: { slide: { id, title, order, content, code, steps, image } } } = this
    const stepMut = steps && steps.length > 0 ? `["${steps.join('", "')}"]` : []

    return `mutation { updateSlide(
  id: "${id}"
  order: ${order}
  title: "${title}"
  content: "${content}"
  code: ${JSON.stringify(code)}
  steps: ${stepMut}
  image: "${image || ''}"
){
  id
  title
  code
  steps
  image
}
}
`
  }

  render() {
    return (
      <div style={{ backgroundColor: 'white' }}>
        <button onClick={() => this.props.handleClose()}> Close Editor</button>
        <GQLPlayground code={this.generatedMutation()} />
      </div>
    )
  }
}

export default SlideEditor

