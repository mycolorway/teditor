import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import CodeBlockEditing from './codeblockediting';
import CodeBlockUI from './codeblockui';
import './codeblocklocale';

export default class Emoji extends Plugin {
  static get requires() {
    return [Widget, CodeBlockEditing, CodeBlockUI];
  }
}
