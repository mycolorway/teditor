import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import HorizontalRuleCommand from './horizontalrulecommand';

import './theme/horizontalrule.css';

export default class HorizontalRuleEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init() {
    this.defineSchema();
    this.defineConverters();
    this.definePostFixer();

    this.editor.commands.add('horizontalRule', new HorizontalRuleCommand(this.editor));
  }

  defineSchema() {
    const { schema } = this.editor.model;

    schema.register('horizontalRule', {
      isObject: true,
      allowWhere: '$block',
    });

    schema.addChildCheck((context, childDefinition) => {
      if (childDefinition.name === 'horizontalRule' && context.endsWith('tableCell')) {
        return false;
      }
      return null;
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
      view: 'hr',
    });

    conversion.for('editingDowncast').elementToElement({
      model: 'horizontalRule',
      view: (modelElement, viewWriter) => {
        const wrapper = viewWriter.createContainerElement('div');
        const hr = viewWriter.createEmptyElement('hr');

        viewWriter.addClass('teditor-horizontal-rule', wrapper);
        viewWriter.insert(viewWriter.createPositionAt(wrapper, 0), hr);

        return toWidget(wrapper, viewWriter, {
          label: 'hr widget',
        });
      },
    });
  }

  definePostFixer() {
    const { document, schema } = this.editor.model;
    document.registerPostFixer((writer) => {
      const changes = document.differ.getChanges();
      return changes.some((change) => {
        if (change.type === 'insert' && change.name === 'horizontalRule') {
          const hr = change.position.nodeAfter;

          if (!hr.nextSibling || schema.isObject(hr.nextSibling)) {
            const paragraph = writer.createElement('paragraph');
            writer.insert(paragraph, hr, 'after');
            return true;
          }

          writer.setSelection(hr.nextSibling, 0);
        }

        return false;
      });
    });
  }
}
