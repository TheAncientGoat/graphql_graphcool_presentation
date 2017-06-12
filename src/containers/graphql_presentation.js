import React from 'react'
import _ from 'lodash'
import {
gql,
graphql,
} from 'react-apollo'

import { Presentation, TitleSlide, Slide } from 'react-presents'

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
      order
      content
      endpoint
      steps
      code
      image
      imageStyle
      links
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
        <Slide render={() => (
          <TitleSlide style={{ height: '100vh' }}>
            <h1>GraphQL</h1>
            <p>Why it is a big deal</p>
          </TitleSlide>
          )}
        />
        {_.orderBy(props.data.allSlides, ['order'], ['asc']).map(slide =>
          <Slide render={() => <DynamicSlide {...slide} />} key={slide.id} />)}
      </Presentation>
    </div>
  )
}

// Order won't update real-time! Must refresh, but it's a feature
// as you generally want to stay on the page you edited

const presentationQuery = gql`query allSlides{
allSlides(orderBy: order_ASC) {
  id
  order
  title
  content
  steps
  endpoint
  code
  image
  imageStyle
  links
  }
}
`

const ConnectedDynamicPresentation = graphql(presentationQuery)(DynamicPresentation)

export default ConnectedDynamicPresentation
