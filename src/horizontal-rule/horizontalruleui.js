import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import horizontalRuleIcon from './theme/icons/horizontalrule.svg';

export default class HorizontalRuleUI extends Plugin {
  init() {
    const { editor } = this;
    const { t } = editor;

    editor.ui.componentFactory.add('horizontalRule', (locale) => {
      const buttonView = new ButtonView(locale);
      const command = editor.commands.get('horizontalRule');

      buttonView.set({
        label: t('Horizontal rule'),
        icon: horizontalRuleIcon,
        tooltip: true,
      });

      buttonView.bind('isEnabled').to(command, 'isEnabled');

      this.listenTo(buttonView, 'execute', () => {
        editor.execute('horizontalRule');
        editor.editing.view.focus();
      });

      return buttonView;
    });
  }
}
