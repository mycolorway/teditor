import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import InsertEmojiCommand from './commands/insertemojicommand';

import './theme/emoji.css';

const EMOJI_IMAGE_CLASS = 'teditor-emoji';
const EMOJI_WRAPPER_CLASS = 'teditor-emoji-wrapper';

function convertModelElement(modelElement, viewWriter) {
  return viewWriter.createEmptyElement('img', {
    src: modelElement.getAttribute('src'),
    class: EMOJI_IMAGE_CLASS,
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

    this.editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(
        this.editor.model,
        (viewElement) => viewElement.hasClass(EMOJI_WRAPPER_CLASS),
      ),
    );

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
        classes: EMOJI_IMAGE_CLASS,
      },
      model: convertViewElement,
      converterPriority: 'high',
    }).elementToElement({ // for backward compatibility
      view: {
        name: 'img',
        attributes: {
          'data-emoji': 'true',
        },
      },
      model: convertViewElement,
      converterPriority: 'high',
    }).add((dispatcher) => {
      dispatcher.on('element:span', (event, data, conversionApi) => {
        if (!conversionApi.consumable.consume(data.viewItem, {
          name: true, classes: EMOJI_WRAPPER_CLASS.split(' '),
        })) {
          return;
        }

        const viewImage = Array.from(data.viewItem.getChildren()).find((viewChild) => viewChild.is('img'));
        if (!viewImage || !viewImage.hasAttribute('src') || !conversionApi.consumable.test(viewImage, { name: true })) {
          return;
        }

        const conversionResult = conversionApi.convertItem(viewImage, data.modelCursor);

        // eslint-disable-next-line no-param-reassign
        data.modelRange = conversionResult.modelRange;
        // eslint-disable-next-line no-param-reassign
        data.modelCursor = conversionResult.modelCursor;
      });
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'emoji-image',
      view: convertModelElement,
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'emoji-image',
      view(modelElement, viewWriter) {
        const imageElement = convertModelElement(modelElement, viewWriter);
        const wrapperElement = viewWriter.createContainerElement('span', {
          class: EMOJI_WRAPPER_CLASS,
        });

        viewWriter.insert(viewWriter.createPositionAt(wrapperElement, 0), imageElement);
        return toWidget(wrapperElement, viewWriter, {
          label: 'emoji widget',
        });
      },
    });
  }
}
