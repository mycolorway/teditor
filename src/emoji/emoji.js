import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import EmojiEditing from './emojiediting';
import EmojiUI from './emojiui';
import './emojilang';

export default class Emoji extends Plugin {
  static get requires() {
    return [EmojiEditing, EmojiUI];
  }
}
