import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class AutoParagraphing extends Plugin {
  init() {
    const { conversion } = this.editor;
    conversion.for('upcast').add((dispatcher) => {
      dispatcher.on('element', (event, data, conversionApi) => {
        // When element is already consumed by higher priority converters then do nothing.
        if (conversionApi.consumable.test(data.viewItem, { name: data.viewItem.name })) {
          const paragraph = conversionApi.writer.createElement('paragraph');

          // Find allowed parent for paragraph that we are going to insert.
          // If current parent does not allow to insert paragraph but
          // one of the ancestors does then split nodes to allowed parent.
          const splitResult = conversionApi.splitToAllowedParent(paragraph, data.modelCursor);

          // When there is no split result it means that we can't insert paragraph in this position.
          if (splitResult) {
            // Insert paragraph in allowed position.
            conversionApi.writer.insert(paragraph, splitResult.position);

            // Convert children to paragraph.
            const { modelRange } = conversionApi.convertChildren(
              data.viewItem,
              conversionApi.writer.createPositionAt(paragraph, 0),
            );

            // Set as conversion result, attribute converters may use this property.
            // eslint-disable-next-line no-param-reassign
            data.modelRange = conversionApi.writer.createRange(
              conversionApi.writer.createPositionBefore(paragraph),
              modelRange.end,
            );

            // Continue conversion inside paragraph.
            // eslint-disable-next-line no-param-reassign
            data.modelCursor = data.modelRange.end;
          }
        }
      }, { priority: 'low' });
    });
  }
}
