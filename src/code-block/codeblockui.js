import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import codeBlockIcon from './theme/icons/codeblock.svg';

export default class CodeBlockUI extends Plugin {
  init() {
    const { editor } = this;
    const { t } = editor;

    editor.ui.componentFactory.add('codeBlock', (locale) => {
      const command = editor.commands.get('codeBlock');


      const buttonView = new ButtonView(locale);
      buttonView.set({
        icon: codeBlockIcon,
        label: t('Insert code block'),
        tooltip: true,
      });

      buttonView.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');

      this.listenTo(buttonView, 'execute', () => {
        editor.execute('codeBlock');
        editor.editing.view.focus();
      });

      return buttonView;
    });
  }
}
