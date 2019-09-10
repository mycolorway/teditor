import Command from '@ckeditor/ckeditor5-core/src/command';

export default class HorizontalRuleCommand extends Command {
  execute() {
    const { model } = this.editor;
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
