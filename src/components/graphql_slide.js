import React from 'react'
import { ContentSlide, Step } from 'react-presents'

import Drawer from 'rc-drawer'
import 'rc-drawer/assets/index.css'

import GQLPlayground from './graphql_query_playground'
import SlideEditor from './graphql_slide_editor'

class DynamicSlide extends React.Component {
  constructor() {
    super()
    this.state = {
      open: false,
    }
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
  }

  handleOpen() {
    this.setState({ open: true })
  }

  handleClose() {
    this.setState({ open: false })
  }

  render() {
    const { id, title, code, endpoint, content, image, imageStyle, links, steps = [] } = this.props
    return (
      <Drawer
        sidebar={<SlideEditor slide={this.props} handleClose={this.handleClose} />}
        {...{ position: 'bottom' }}
        open={this.state.open}
        style={{ overflow: 'hide' }}
      >
        <ContentSlide>
          <button style={{ marginBottom: '1rem' }} onClick={this.handleOpen}>Edit</button>
          <h1>{title}</h1>
          {image ?
            <img src={image} style={{ maxHeight: '70vh', ...(JSON.parse(imageStyle)) }} alt={title} /> : ''}
          <p>{content}</p>
          { links ? links.map(link => <a href={link} key={link}>{link}</a>) : ''}
          {steps ?
           steps.map((step, i) => <Step index={i} key={`${step}`}><li>{step}</li></Step>) : ''}
          {code ? <GQLPlayground {...{ code, endpoint, id }} /> : ''}
        </ContentSlide>
      </Drawer>
    )
  }
}

export default DynamicSlide
