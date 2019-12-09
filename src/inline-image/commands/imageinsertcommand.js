import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertImage, isImageAllowed } from '../utils';

export default class ImageInsertCommand extends Command {
  refresh() {
    this.isEnabled = isImageAllowed(this.editor.model);
  }

  execute(options) {
    const { model } = this.editor;

    model.change((writer) => {
      const sources = Array.isArray(options.source) ? options.source : [options.source];

      sources.forEach((src) => {
        insertImage(writer, model, { src });
      });
    });
  }
}
