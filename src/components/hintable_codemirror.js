import React from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css'
import 'codemirror/addon/hint/show-hint.css' // without this css hints won't show
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/lint/lint'
import 'codemirror-graphql/hint'
import 'codemirror-graphql/lint'
import 'codemirror-graphql/mode'


class HintableCodeMirror extends React.Component {
  constructor() {
    super()
    this.autoComplete = this.autoComplete.bind(this)
  }

  autoComplete(cm) {
    const codeMirror = this.codeMirror.getCodeMirrorInstance()
    const hintOptions = {
      schema: this.props.schema,
    }
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

export default HintableCodeMirror
