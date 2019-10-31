import { translate } from '@ckeditor/ckeditor5-utils/src/translation-service';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { isWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import indexOf from '@ckeditor/ckeditor5-utils/src/dom/indexof';
import './magicblocklocale';

import './theme/magicblock.css';

export default class MagicBlock extends Plugin {
  init() {
    this.definePostFixer();
    this.defineUIEvents();
  }

  definePostFixer() {
    const { model } = this.editor;
    const editingView = this.editor.editing.view;
    const viewRoot = editingView.document.getRoot();

    editingView.document.registerPostFixer((writer) => {
      Array.from(viewRoot.getChildren()).forEach((child) => {
        if (child.is('uiElement') && child.hasClass('magic-block') && !isMagicBlockStillNeeded(child)) {
          writer.remove(child);
        }
      });

      Array.from(viewRoot.getChildren()).forEach((child) => {
        if (!child.is('containerElement')) {
          return;
        }

        if (!child.previousSibling && isWidgetOrObject(child)) {
          insertMagicBlockAt(writer, writer.createPositionBefore(child));
        }

        if (isWidgetOrObject(child)
          && (!child.nextSibling || isWidgetOrObject(child.nextSibling))) {
          insertMagicBlockAt(writer, writer.createPositionAfter(child));
        }
      });
    });

    model.document.registerPostFixer((writer) => {
      const { selection } = model.document;
      if (selection.rangeCount !== 1) return;

      const range = selection.getFirstRange();
      if (!range.isCollapsed) return;

      const limitElement = range.start.nodeAfter;
      const { schema } = model;
      if (limitElement && schema.isLimit(limitElement) && !schema.isInline(limitElement)) {
        const fixedRanges = writer.createRange(
          range.start, writer.createPositionAfter(range.start.nodeAfter),
        );
        writer.setSelection(fixedRanges);
      }
    });
  }

  defineUIEvents() {
    this.editor.ui.on('ready', () => {
      const editingView = this.editor.editing.view;
      const domRoot = editingView.getDomRoot();

      domRoot.addEventListener('mousedown', (event) => {
        const { classList } = event.target;
        if (classList.contains('magic-block') || classList.contains('magic-block-tips')) {
          const viewPosition = editingView.domConverter.domPositionToView(
            event.target.parentNode, indexOf(event.target),
          );
          const modelPosition = this.editor.editing.mapper.toModelPosition(viewPosition);

          this.editor.model.change((writer) => {
            const paragraph = writer.createElement('paragraph');

            writer.insert(paragraph, modelPosition);
            writer.setSelection(paragraph, 0);
          });
        }
      });
    });
  }
}

function isMagicBlockStillNeeded(magicBlock) {
  if (!magicBlock.previousSibling && isWidgetOrObject(magicBlock.nextSibling)) {
    return true;
  }

  if (!magicBlock.nextSibling && isWidgetOrObject(magicBlock.previousSibling)) {
    return true;
  }

  if (isWidgetOrObject(magicBlock.previousSibling)
    && isWidgetOrObject(magicBlock.nextSibling)) {
    return true;
  }

  return false;
}

function insertMagicBlockAt(writer, position) {
  const magicBlock = writer.createUIElement('p', { class: 'magic-block' }, renderMagicBlock);

  writer.insert(position, magicBlock);
}

function renderMagicBlock(domDocument) {
  const domElement = this.toDomElement(domDocument);

  const tipsElement = domDocument.createElement('div');
  tipsElement.classList.add('magic-block-tips');
  tipsElement.textContent = translate('zh-CN', 'Click to insert paragraph');

  domElement.appendChild(tipsElement);

  return domElement;
}

function isWidgetOrObject(element) {
  if (!element) return false;

  if (isWidget(element)) {
    return true;
  }

  if (element.is('element') && element.getCustomProperty('object')) {
    return true;
  }

  return false;
}
