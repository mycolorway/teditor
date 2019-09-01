import Command from '@ckeditor/ckeditor5-core/src/command';

export default class InsertEmojiCommand extends Command {
  execute({ value }) {
    const { editor } = this;

    editor.model.change((writer) => {
      const emojiImage = writer.createElement('emoji-image', { src: value });
      editor.model.insertContent(emojiImage);
      writer.setSelection(emojiImage, 'after');
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;
    this.isEnabled = model.schema.checkChild(selection.focus.parent, 'emoji-image');
  }
}
