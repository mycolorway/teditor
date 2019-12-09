import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertImage, isImageAllowed } from '../utils';

export default class ImageUploadCommand extends Command {
  refresh() {
    this.isEnabled = isImageAllowed(this.editor.model);
  }

  execute(options) {
    const { editor } = this;
    const { model } = editor;

    const fileRepository = editor.plugins.get(FileRepository);

    model.change((writer) => {
      const filesToUpload = Array.isArray(options.file) ? options.file : [options.file];

      filesToUpload.forEach((file) => {
        uploadImage(writer, model, fileRepository, file);
      });
    });
  }
}

function uploadImage(writer, model, fileRepository, file) {
  const loader = fileRepository.createLoader(file);

  // Do not throw when upload adapter is not set. FileRepository will log an error anyway.
  if (!loader) {
    return;
  }

  insertImage(writer, model, { uploadId: loader.id });
}
