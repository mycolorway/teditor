/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';

export default class WidgetBlock extends Plugin {
  init() {
    this.definePostFixer();
  }

  definePostFixer() {
    const ElementNames = ['table', 'image', 'listItem', 'blockQuote', 'codeBlock'];
    const { document, schema } = this.editor.model;

    document.registerPostFixer((writer) => {
      const changes = document.differ.getChanges();
      return changes.some((change) => {
        console.log(change);
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
