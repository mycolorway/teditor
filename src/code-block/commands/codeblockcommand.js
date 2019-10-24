import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import { isCodeBlockSelected } from '../utils';

export default class CodeBlockCommand extends Command {
  execute({ forceValue } = {}) {
    const { editor } = this;
    const { model } = editor;
    const { selection } = model.document;
    const value = (forceValue === undefined) ? !this.value : forceValue;

    editor.model.change((writer) => {
      if (value) {
        const insertPosition = findOptimalInsertionPosition(selection, model);
        const codeBlock = writer.createElement('codeBlock', {
          lang: 'none',
          value: '',
        });
        editor.model.insertContent(codeBlock, insertPosition);
        writer.setSelection(codeBlock, 'on');
      } else {
        const codeBlockElement = isCodeBlockSelected(selection);
        if (codeBlockElement) {
          writer.remove(codeBlockElement);
        }
      }
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;
    const firstPosition = selection.getFirstPosition();

    this.value = isCodeBlockSelected(selection);
    this.isEnabled = this.value || model.schema.findAllowedParent(firstPosition, 'codeBlock');
  }
}
