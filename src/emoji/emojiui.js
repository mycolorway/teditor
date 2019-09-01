import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import emojiIcon from './theme/icons/emoji.svg';
import InsertEmojiView from './ui/insertemojiview';

export default class EmojiUI extends Plugin {
  init() {
    const { editor } = this;
    const { t } = editor;

    editor.ui.componentFactory.add('emoji', (locale) => {
      const dropdownView = createDropdown(locale);
      const command = editor.commands.get('insertTable');

      dropdownView.bind('isEnabled').to(command);

      const insertEmojiView = new InsertEmojiView({
        locale,
        config: editor.config.get('emoji'),
      });
      dropdownView.panelView.children.add(insertEmojiView);
      insertEmojiView.delegate('execute').to(dropdownView);

      dropdownView.buttonView.set({
        icon: emojiIcon,
        label: t('Insert emoji'),
        tooltip: true,
      });

      this.listenTo(dropdownView, 'execute', (e, { src }) => {
        editor.execute('insertEmoji', { value: src });
        editor.editing.view.focus();
      });

      return dropdownView;
    });
  }
}
