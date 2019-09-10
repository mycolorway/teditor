import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import CodeBlockEditing from './codeblockediting';
import CodeBlockUI from './codeblockui';
import './codeblocklocale';

export default class Emoji extends Plugin {
  static get requires() {
    return [CodeBlockEditing, CodeBlockUI];
  }
}
