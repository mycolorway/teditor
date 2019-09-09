import Command from '@ckeditor/ckeditor5-core/src/command';

export default class HorizontalRuleCommand extends Command {
  execute() {
    const { model } = this.editor;
    const { document } = model;

    // eslint-disable-next-line consistent-return
    document.registerPostFixer((writer) => {
      const changes = document.differ.getChanges();

      // eslint-disable-next-line no-restricted-syntax
      for (const entry of changes) {
        if (entry.type === 'insert' && entry.name === 'horizontalRule') {
          const hr = entry.position.nodeAfter;

          if (!hr.nextSibling || model.schema.isObject(hr.nextSibling)) {
            const paragraph = writer.createElement('paragraph');
            writer.insert(paragraph, hr, 'after');
            return true;
          }

          writer.setSelection(hr.nextSibling, 0);
        }
      }
    });

    model.change((writer) => {
      const hr = writer.createElement('horizontalRule');
      model.insertContent(hr);
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;
    const firstPosition = selection.getFirstPosition();
    const selectedElement = selection.getSelectedElement();

    this.isEnabled = model.schema.findAllowedParent(
      firstPosition, 'horizontalRule',
    ) && !(selectedElement && model.schema.isObject(selectedElement));
  }
}
