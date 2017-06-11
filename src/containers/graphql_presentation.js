import React from 'react'

import {
gql,
graphql,
} from 'react-apollo'

import { Presentation, Slide } from 'react-presents'

import { upsert } from '../utils'
import DynamicSlide from '../components/graphql_slide'

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

const ConnectedDynamicPresentation = graphql(presentationQuery)(DynamicPresentation)

export default ConnectedDynamicPresentation
