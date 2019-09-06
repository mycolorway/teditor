import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import HorizontalRuleCommand from './horizontalrulecommand';

import './theme/horizontalrule.css';

export default class HorizontalRuleEditing extends Plugin {
  init() {
    this.defineSchema();
    this.defineConverters();

    this.editor.commands.add('horizontalRule', new HorizontalRuleCommand(this.editor));
  }

  defineSchema() {
    this.editor.model.schema.register('horizontalRule', {
      isObject: true,
      allowWhere: '$block',
    });
  }

  defineConverters() {
    const { conversion } = this.editor;

    conversion.for('upcast').elementToElement({
      view: 'hr',
      model: 'horizontalRule',
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'horizontalRule',
      view: (modelElement, viewWriter) => viewWriter.createEmptyElement('hr'),
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'horizontalRule',
      view: (modelElement, viewWriter) => {
        const wrapper = viewWriter.createContainerElement('div');
        const hr = viewWriter.createEmptyElement('hr');

        viewWriter.addClass('teditor-horizontal-rule', wrapper);
        viewWriter.insert(viewWriter.createPositionAt(wrapper, 0), hr);

        return toWidget(wrapper, viewWriter);
      },
    });
  }
}
