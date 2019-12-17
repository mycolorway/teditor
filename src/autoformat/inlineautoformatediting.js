import getLastTextLine from '@ckeditor/ckeditor5-typing/src/utils/getlasttextline';

export default class InlineAutoformatEditing {
  static get pluginName() {
    return 'InlineAutoformatEditing';
  }

  constructor(editor, testRegexpOrCallback, attributeOrCallback) {
    let regExp;
    let attributeKey;
    let testCallback;
    let formatCallback;

    if (testRegexpOrCallback instanceof RegExp) {
      regExp = testRegexpOrCallback;
    } else {
      testCallback = testRegexpOrCallback;
    }

    if (typeof attributeOrCallback === 'string') {
      attributeKey = attributeOrCallback;
    } else {
      formatCallback = attributeOrCallback;
    }

    testCallback = testCallback || ((text) => {
      let result = regExp.exec(text);
      const remove = [];
      const format = [];

      while (result !== null) {
        if (result && result.length < 4) {
          break;
        }

        let { index } = result;
        const {
          1: leftDel,
          2: content,
          3: rightDel,
        } = result;

        const found = leftDel + content + rightDel;
        index += result[0].length - found.length;

        const delStart = [
          index,
          index + leftDel.length,
        ];
        const delEnd = [
          index + leftDel.length + content.length,
          index + leftDel.length + content.length + rightDel.length,
        ];

        remove.push(delStart);
        remove.push(delEnd);

        format.push([index + leftDel.length, index + leftDel.length + content.length]);
        result = regExp.exec(text);
      }

      return {
        remove,
        format,
      };
    });

    formatCallback = formatCallback || ((writer, rangesToFormat) => {
      const validRanges = editor.model.schema.getValidRanges(rangesToFormat, attributeKey);

      let result = validRanges.next();
      while (!result.done) {
        writer.setAttribute(attributeKey, true, result.value);
        result = validRanges.next();
      }

      writer.removeSelectionAttribute(attributeKey);
    });

    const viewDocument = editor.editing.view.document;
    editor.model.document.on('change', (evt, batch) => {
      if (viewDocument.isComposing) return;

      if (batch.type === 'transparent') {
        return;
      }

      const { model } = editor;
      const { selection } = model.document;

      if (!selection.isCollapsed) {
        return;
      }

      const changes = Array.from(model.document.differ.getChanges());
      const entry = changes[0];

      if (changes.length !== 1 || entry.type !== 'insert' || entry.name !== '$text' || entry.length !== 1) {
        return;
      }

      const { focus } = selection;
      const block = focus.parent;
      const { text, range } = getLastTextLine(
        model.createRange(model.createPositionAt(block, 0), focus), model,
      );
      const testOutput = testCallback(text);
      const rangesToFormat = testOutputToRanges(range.start, testOutput.format, model);
      const rangesToRemove = testOutputToRanges(range.start, testOutput.remove, model);

      if (!(rangesToFormat.length && rangesToRemove.length)) {
        return;
      }

      model.enqueueChange((writer) => {
        const hasChanged = formatCallback(writer, rangesToFormat);

        if (hasChanged === false) {
          return;
        }

        rangesToRemove.reverse().forEach((r) => writer.remove(r));
      });
    });
  }
}

function testOutputToRanges(start, arrays, model) {
  return arrays
    .filter((array) => (array[0] !== undefined && array[1] !== undefined))
    .map((array) => model.createRange(start.getShiftedBy(array[0]), start.getShiftedBy(array[1])));
}
