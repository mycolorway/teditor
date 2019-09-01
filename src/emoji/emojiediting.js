import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InsertEmojiCommand from './commands/insertemojicommand';

import './theme/emoji.css';

function convertModelElement(modelElement, viewWriter) {
  return viewWriter.createEmptyElement('img', {
    src: modelElement.getAttribute('src'),
    class: 'teditor-emoji',
  });
}

function convertViewElement(viewElement, modelWriter) {
  return modelWriter.createElement('emoji-image', {
    src: viewElement.getAttribute('src'),
  });
}

export default class EmojiEditing extends Plugin {
  init() {
    this.defineSchema();
    this.defineConverters();

    this.editor.commands.add('insertEmoji', new InsertEmojiCommand(this.editor));
  }

  defineSchema() {
    const { schema } = this.editor.model;

    schema.register('emoji-image', {
      allowWhere: '$text',
      isInline: true,
      isObject: true,
      allowAttributes: ['src'],
    });
  }

  defineConverters() {
    const { conversion } = this.editor;

    conversion.for('upcast').elementToElement({
      view: {
        name: 'img',
        classes: 'teditor-emoji',
      },
      model: convertViewElement,
      converterPriority: 'high',
    }).elementToElement({
      view: {
        name: 'img',
        attributes: {
          'data-emoji': 'true',
        },
      },
      model: convertViewElement,
      converterPriority: 'high',
    });

    conversion.for('downcast').elementToElement({
      model: 'emoji-image',
      view: convertModelElement,
    });
  }
}
