import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';

export default class HorizontalRuleCommand extends Command {
  execute() {
    const { model } = this.editor;

    const result = model.change((writer) => {
      const fragment = writer.createDocumentFragment();
      const hr = writer.createElement('horizontalRule');
      const paragraph = writer.createElement('paragraph');

      writer.append(hr, fragment);
      writer.append(paragraph, fragment);

      return fragment;
    });

    model.insertContent(result);
  }

  refresh() {
    const { model } = this.editor;
    const { schema } = model;
    const { selection } = model.document;

    let { parent } = findOptimalInsertionPosition(selection, model);
    if (parent.isEmpty && !parent.is('$root')) {
      parent = parent.parent;
    }

    const isAllowedInParent = schema.checkChild(parent, 'horizontalRule');
    const selectedElement = selection.getSelectedElement();

    this.isEnabled = isAllowedInParent
      && !(selectedElement && schema.isObject(selectedElement));
  }
}
