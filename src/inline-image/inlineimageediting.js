import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toImageWidget } from '@ckeditor/ckeditor5-image/src/image/utils';
import first from '@ckeditor/ckeditor5-utils/src/first';
import ImageInsertCommand from './commands/imageinsertcommand';
import ImageUploadCommand from './commands/imageuploadcommand';

import './theme/image.css';

const INLINE_IMAGE_WRAPPER_CLASS = 'teditor-inline-image image';

export default class InlineImageEditing extends Plugin {
  init() {
    this.defineSchema();
    this.defineConverters();

    this.editor.commands.add('imageInsert', new ImageInsertCommand(this.editor));
    this.editor.commands.add('imageUpload', new ImageUploadCommand(this.editor));
  }

  defineSchema() {
    const { schema } = this.editor.model;

    schema.extend('image', {
      isBlock: false,
      isInline: true,
      allowWhere: '$text',
    });
  }

  defineConverters() {
    const { conversion } = this.editor;
    const { schema } = this.editor.model;

    conversion.for('dataDowncast').add(inlineImageModelToViewConverter(schema));
    conversion.for('editingDowncast').add(inlineImageModelToViewConverter(schema, { widget: true }));

    conversion.for('upcast')
      .attributeToAttribute({
        view: {
          name: 'span',
          styles: {
            width: /.+/,
          },
        },
        model: {
          key: 'width',
          value: (viewElement) => viewElement.getStyle('width'),
        },
      })
      .add(inlineImageViewToModelConverter());
  }
}

function inlineImageModelToViewConverter(schema, { widget = false } = {}) {
  return (dispatcher) => {
    dispatcher.on('insert:image', (event, data, conversionApi) => {
      if (!conversionApi.consumable.test(data.item, 'insert')) {
        return;
      }

      const { parent } = data.item;
      if (!parent || !parent.document || !schema.checkChild(parent, '$text')) {
        return;
      }

      conversionApi.consumable.consume(data.item, 'insert');
      const viewElement = createInlineImageViewElement(conversionApi.writer, { widget });
      const viewPosition = conversionApi.mapper.toViewPosition(data.range.start);

      conversionApi.mapper.bindElements(data.item, viewElement);
      conversionApi.writer.insert(viewPosition, viewElement);
    }, { priority: 'high' });
  };
}

function createInlineImageViewElement(writer, { widget = false } = {}) {
  const imageElement = writer.createEmptyElement('img');
  const figureElement = writer.createContainerElement('span', {
    class: INLINE_IMAGE_WRAPPER_CLASS,
  });

  writer.insert(writer.createPositionAt(figureElement, 0), imageElement);

  if (widget) {
    return toImageWidget(figureElement, writer, 'image widget');
  }

  return figureElement;
}

function inlineImageViewToModelConverter() {
  return (dispatcher) => {
    dispatcher.on('element:span', (event, data, conversionApi) => {
      // Do not convert if this is not an "image figure".
      if (!conversionApi.consumable.test(
        data.viewItem, { name: true, classes: INLINE_IMAGE_WRAPPER_CLASS.split(' ') },
      )) {
        return;
      }

      // Find an image element inside the figure element.
      const viewImage = Array.from(data.viewItem.getChildren())
        .find((viewChild) => viewChild.is('img'));

      // Do not convert if image element is absent,
      // is missing src attribute or was already converted.
      if (!viewImage || !viewImage.hasAttribute('src') || !conversionApi.consumable.test(viewImage, { name: true })) {
        return;
      }

      conversionApi.consumable.consume(
        data.viewItem, { name: true, classes: INLINE_IMAGE_WRAPPER_CLASS.split(' ') },
      );

      // Convert view image to model image.
      const conversionResult = conversionApi.convertItem(viewImage, data.modelCursor);

      // Get image element from conversion result.
      const modelImage = first(conversionResult.modelRange.getItems());

      // When image wasn't successfully converted then finish conversion.
      if (!modelImage) {
        return;
      }

      // Convert rest of the figure element's children as an image children.
      conversionApi.convertChildren(
        data.viewItem, conversionApi.writer.createPositionAt(modelImage, 0),
      );

      // Set image range as conversion result.
      // eslint-disable-next-line no-param-reassign
      data.modelRange = conversionResult.modelRange;

      // Continue conversion where image conversion ends.
      // eslint-disable-next-line no-param-reassign
      data.modelCursor = conversionResult.modelCursor;
    }, { priority: 'high' });
  };
}
