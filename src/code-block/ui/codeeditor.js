import CodeMirror from 'codemirror';
import { Component } from '@mycolorway/tao';
import 'codemirror/lib/codemirror.css';
import '../theme/codeeditor.css';
// import 'codemirror/mode/javascript/javascript';

export default Component('teditor-code-editor', {
  properties: {
    value: String,
  },

  connected() {
    this.codeMirror = CodeMirror(this, {
      value: this.value,
      mode: 'null',
      inputStyle: 'contenteditable',
      autofocus: true,
      tabSize: 2,
      lineNumbers: true,
      viewportMargin: Infinity,
    });

    this.codeMirror.on('changes', () => {
      const value = this.codeMirror.getValue();
      this.namespacedTrigger('change', {
        detail: { value },
        bubbles: true,
      });
      // this.editor.model.change((writer) => {
      //   const { mapper } = this.editor.editing;
      //   const { domConverter } = this.editor.editing.view;
      //   const viewElement = domConverter.domToView(element);
      //   const modelElement = mapper.toModelElement(viewElement.parent);
      //   writer.setAttribute('value', value, modelElement);
      // });
    });
  },

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus();
    }
  },
});
