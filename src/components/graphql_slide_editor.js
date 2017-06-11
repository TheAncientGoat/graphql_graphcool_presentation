import React from 'react'

import {
gql,
graphql,
} from 'react-apollo'

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

export default MutationButton

