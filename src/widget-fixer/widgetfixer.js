import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class WidgetFixer extends Plugin {
  init() {
    this.definePostFixer();
  }

  definePostFixer() {
    const ElementNames = ['table', 'listItem', 'blockQuote', 'codeBlock'];
    const { editor } = this;
    const { document, schema } = editor.model;

    document.registerPostFixer((writer) => {
      if (editor.state !== 'ready') return false;

      const changes = document.differ.getChanges();
      return changes.some((change) => {
        if (change.type === 'insert' && ElementNames.includes(change.name)) {
          const node = change.position.nodeAfter;

          if (!node.nextSibling || schema.isObject(node.nextSibling)) {
            const paragraph = writer.createElement('paragraph');
            writer.insert(paragraph, node, 'after');
            return true;
          }
        }
        return false;
      });
    });
  }
}
