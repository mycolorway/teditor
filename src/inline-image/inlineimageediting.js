import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ImageInsertCommand from './commands/imageinsertcommand';
import ImageUploadCommand from './commands/imageuploadcommand';

import './theme/image.css';

export default class InlineImageEditing extends Plugin {
  init() {
    this.defineSchema();

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
}
