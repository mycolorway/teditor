import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import InlineImageEditing from './inlineimageediting';

export default class InlineImage extends Plugin {
  static get requires() {
    return [InlineImageEditing];
  }
}
