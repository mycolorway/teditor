import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CodeBlockCommand from './commands/codeblockcommand';

import './theme/codeblock.css';

function fixCodeBlockLineBreak({ codeBlock, change, writer }) {
  if (change.type === 'insert') {
    const endPosition = writer.createPositionAt(codeBlock, change.position.offset + change.length);
    if (endPosition.isAtEnd) {
      const insertedText = change.position.textNode
        ? change.position.textNode.data.substring(change.position.offset, endPosition.offset)
        : change.position.nodeAfter.data.substring(0, change.length);
      if (insertedText === '\n') {
        writer.insertText('\n', codeBlock, 'end');
        writer.setSelection(codeBlock, codeBlock.maxOffset - 1);
        return true;
      }
    }
  }

  const endPosition = writer.createPositionAt(codeBlock, 'end');
  const textNode = endPosition.textNode || endPosition.nodeBefore;
  if (textNode && textNode.is('text') && textNode.data.substring(textNode.data.length - 1) !== '\n') {
    writer.appendText('\n', codeBlock);
    if ((change.type === 'insert' && writer.createPositionAt(codeBlock, change.position.offset + change.length + 1).isAtEnd)
      || (change.type === 'remove' && writer.createPositionAt(codeBlock, change.position.offset + 1).isAtEnd)) {
      writer.setSelection(codeBlock, codeBlock.maxOffset - 1);
    }
  }

  return false;
}

export default class EmojiEditing extends Plugin {
  init() {
    this.defineSchema();
    this.defineConverters();
    this.defineKeystrokes();
    this.definePostFixer();

    this.editor.commands.add('codeBlock', new CodeBlockCommand(this.editor));
  }

  defineSchema() {
    const { schema } = this.editor.model;

    schema.register('codeBlock', {
      isLimit: true,
      isBlock: true,
      allowAttributes: ['lang'],
      allowWhere: '$block',
      allowContentOf: '$block',
    });

    schema.extend('$text', { allowIn: 'codeBlock' });

    schema.addAttributeCheck((context) => !context.endsWith('codeBlock $text'));

    schema.addChildCheck((context, childDefinition) => {
      const disallowed = ['table', 'emoji-image', 'image', 'paragraph'];
      if (context.endsWith('codeBlock') && disallowed.indexOf(childDefinition.name) > -1) {
        return false;
      }
      return null;
    });
  }

  defineConverters() {
    const { conversion } = this.editor;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'pre',
      },
      model(viewElement, modelWriter) {
        return modelWriter.createElement('codeBlock', {
          lang: viewElement.getAttribute('data-lang') || viewElement.getAttribute('class') || 'none',
        });
      },
      converterPriority: 'high',
    });

    conversion.for('downcast').elementToElement({
      model: 'codeBlock',
      view(modelElement, viewWriter) {
        return viewWriter.createContainerElement('pre', {
          class: modelElement.getAttribute('lang') || 'none',
        });
      },
    });
  }

  defineKeystrokes() {
    const viewDocument = this.editor.editing.view.document;
    this.listenTo(viewDocument, 'delete', (event, data) => {
      if (data.direction !== 'backward') return;

      const { selection } = this.editor.model.document;
      if (!selection.isCollapsed) return;

      const firstPosition = selection.getFirstPosition();
      if (!firstPosition.isAtStart) return;

      const positionParent = firstPosition.parent;
      if (!positionParent.is('element', 'codeBlock')) return;

      this.editor.execute('codeBlock');

      data.preventDefault();
      event.stop();
    }, { priority: 'high' });

    this.listenTo(viewDocument, 'enter', (event, data) => {
      const { selection } = this.editor.model.document;
      const positionParent = selection.getFirstPosition().parent;

      if (positionParent.is('element', 'codeBlock')) {
        this.editor.execute('input', { text: '\n' });

        data.preventDefault();
        event.stop();
        this.editor.editing.view.scrollToTheSelection();
      }
    });
  }

  definePostFixer() {
    const { document } = this.editor.model;
    document.registerPostFixer((writer) => {
      const { isComposing } = this.editor.editing.view.document;
      const changes = document.differ.getChanges();
      return changes.some((change) => {
        if (!isComposing && change.type === 'insert' && change.name === '$text'
          && change.position.parent.is('element', 'codeBlock')) {
          const codeBlock = change.position.parent;
          if (fixCodeBlockLineBreak({
            codeBlock,
            change,
            writer,
          })) {
            return true;
          }
        } else if (!isComposing && change.type === 'remove' && change.name === '$text'
          && change.position.parent.is('element', 'codeBlock')) {
          const codeBlock = change.position.parent;
          if (fixCodeBlockLineBreak({
            codeBlock,
            change,
            writer,
          })) {
            return true;
          }
        }
        return false;
      });
    });
  }
}
