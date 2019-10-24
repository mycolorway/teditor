import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
// import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import CodeBlockCommand from './commands/codeblockcommand';
import {
  isCodeBlockSelected, getCodeBlockValue, disableCommand, enableCommand,
} from './utils';

import './theme/codeblock.css';

const CODE_BLOCK_CLASSES = 'teditor-code-block';
const CODE_BLOCK_SELECTED_CLASS = 'editing';

export default class CodeBlockEditing extends Plugin {
  init() {
    this.defineSchema();
    this.defineConverters();

    this.previouslySelected = new Set();

    this.editor.editing.mapper.on(
      'viewToModelPosition',
      (event, data) => {
        const { mapper, viewPosition } = data;

        const viewParent = mapper.findMappedViewAncestor(viewPosition);

        if (viewParent.is('pre') || viewParent.hasClass(CODE_BLOCK_CLASSES)) {
          const modelParent = mapper.toModelElement(viewParent);
          // eslint-disable-next-line no-param-reassign
          data.modelPosition = this.editor.model.createPositionAt(modelParent, 'after');
        }
      },
    );

    this.editor.commands.add('codeBlock', new CodeBlockCommand(this.editor));
  }

  defineSchema() {
    const { schema } = this.editor.model;

    schema.register('codeBlock', {
      isObject: true,
      isBlock: true,
      allowAttributes: ['lang', 'value'],
      allowWhere: '$block',
    });
  }

  defineConverters() {
    const { conversion } = this.editor;

    conversion.for('upcast').add((dispatcher) => {
      dispatcher.on('element', (event, data, conversionApi) => {
        if (data.viewItem.is('pre') && !conversionApi.consumable.consume(data.viewItem, { name: true })) {
          return;
        }

        if (data.viewItem.is('div') && !conversionApi.consumable.consume(data.viewItem, {
          name: true,
          classes: CODE_BLOCK_CLASSES,
        })) {
          return;
        }

        const codeBlock = conversionApi.writer.createElement('codeBlock');
        const lang = data.viewItem.getAttribute('data-lang') || data.viewItem.getAttribute('class') || 'none';
        conversionApi.writer.setAttribute('lang', lang, codeBlock);
        conversionApi.writer.setAttribute('value', getCodeBlockValue(data.viewItem), codeBlock);

        // Find allowed parent for paragraph that we are going to insert.
        // If current parent does not allow to insert paragraph but
        // one of the ancestors does then split nodes to allowed parent.
        const splitResult = conversionApi.splitToAllowedParent(codeBlock, data.modelCursor);

        // When there is no split result it means that we can't insert paragraph in this position.
        if (splitResult) {
          // Insert paragraph in allowed position.
          conversionApi.writer.insert(codeBlock, splitResult.position);

          // eslint-disable-next-line no-param-reassign
          data.modelRange = conversionApi.writer.createRange(
            conversionApi.writer.createPositionBefore(codeBlock),
            conversionApi.writer.createPositionAfter(codeBlock),
          );

          // eslint-disable-next-line no-param-reassign
          data.modelCursor = data.modelRange.end;
        }
      });
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'codeBlock',
      view: (modelElement, viewWriter) => {
        const preElement = viewWriter.createContainerElement('pre', {
          class: modelElement.getAttribute('lang'),
        });

        const valueNode = viewWriter.createText(modelElement.getAttribute('value'));
        viewWriter.insert(viewWriter.createPositionAt(preElement, 0), valueNode);
        return preElement;
      },
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'codeBlock',
      view: (modelElement, viewWriter) => {
        const codeBlockValue = modelElement.getAttribute('value');
        const codeBlockElement = viewWriter.createContainerElement('div', {
          class: CODE_BLOCK_CLASSES,
          'data-lang': modelElement.getAttribute('lang'),
          'data-value': codeBlockValue,
          contenteditable: 'false',
        });
        codeBlockElement.getFillerOffset = () => null;

        const codeEditorElement = viewWriter.createUIElement('teditor-code-editor', {
          class: 'teditor-code-editor',
          value: codeBlockValue,
        });
        viewWriter.insert(viewWriter.createPositionAt(codeBlockElement, 0), codeEditorElement);

        return codeBlockElement;
      },
    }).add((dispatcher) => {
      dispatcher.on('attribute:data-value:codeBlock', (event, data, conversionApi) => {
        if (!conversionApi.consumable.consume(data.item, 'changeattributes:data-value')) {
          return;
        }

        const viewItem = conversionApi.mapper.toViewElement(data.item);
        conversionApi.writer.setAttribute('data-value', data.attributeNewValue, viewItem);
        event.stop();
      });

      dispatcher.on('selection', (event, { selection }, conversionApi) => {
        this.clearPreviousSelected(conversionApi.writer);
        const inputCommand = this.editor.commands.get('input');
        const codeBlockElement = isCodeBlockSelected(selection);
        if (codeBlockElement) {
          const viewItem = conversionApi.mapper.toViewElement(codeBlockElement);
          this.previouslySelected.add(viewItem);
          conversionApi.writer.addClass(CODE_BLOCK_SELECTED_CLASS, viewItem);
          disableCommand(inputCommand);

          // const { domConverter } = this.editor.editing.view;
          // const codeEditorElement = viewItem.getChild(0);
          // const codeEditor = domConverter.mapViewToDom(codeEditorElement);
          // codeEditor.focus();

          event.stop();
        } else {
          enableCommand(inputCommand);
        }
      });

      // dispatcher.on('remove:codeBlock', (event, data, conversionApi) => {
      //   const viewStart = conversionApi.mapper.toViewPosition(data.position);
      //   const viewItem = viewStart.nodeAfter;
      //   const codeEditorElement = viewItem.getChild(0);

      //   const codeEditor = codeEditorElement.getCustomProperty('codeEditor');
      //   codeEditor.destroy();

      //   conversionApi.writer.remove(viewItem);
      //   conversionApi.mapper.unbindViewElement(viewItem);
      //   event.stop();
      // });
    });
  }

  clearPreviousSelected(writer) {
    this.previouslySelected.forEach((selected) => {
      writer.removeClass(CODE_BLOCK_SELECTED_CLASS, selected);
    });

    this.previouslySelected.clear();
  }
}
