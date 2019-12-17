/* eslint-disable no-new */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import BlockAutoformatEditing from './blockautoformatediting';
import InlineAutoformatEditing from './inlineautoformatediting';

export default class Autoformat extends Plugin {
  static get pluginName() {
    return 'Autoformat';
  }

  afterInit() {
    this.addListAutoformats();
    this.addBasicStylesAutoformats();
    this.addHeadingAutoformats();
    this.addBlockQuoteAutoformats();
    this.addCodeBlockAutoformats();
  }

  addListAutoformats() {
    const { commands } = this.editor;

    if (commands.get('bulletedList')) {
      new BlockAutoformatEditing(this.editor, /^[*-]\s$/, 'bulletedList');
    }

    if (commands.get('numberedList')) {
      new BlockAutoformatEditing(this.editor, /^1[.|)]\s$/, 'numberedList');
    }
  }

  addBasicStylesAutoformats() {
    const { commands } = this.editor;

    if (commands.get('bold')) {
      const boldCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'bold');

      new InlineAutoformatEditing(this.editor, /(\*\*)([^*\s]+)(\*\*\s)$/g, boldCallback);
      new InlineAutoformatEditing(this.editor, /(__)([^_\s]+)(__\s)$/g, boldCallback);
    }

    if (commands.get('italic')) {
      const italicCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'italic');

      new InlineAutoformatEditing(this.editor, /(?:^|[^*])(\*)([^*_\s]+)(\*\s)$/g, italicCallback);
      new InlineAutoformatEditing(this.editor, /(?:^|[^_])(_)([^_\s]+)(_\s)$/g, italicCallback);
    }

    if (commands.get('code')) {
      const codeCallback = getCallbackFunctionForInlineAutoformat(this.editor, 'code');

      new InlineAutoformatEditing(this.editor, /(`)([^`\s]+)(`\s)$/g, codeCallback);
    }
  }

  addHeadingAutoformats() {
    const command = this.editor.commands.get('heading');

    if (command) {
      command.modelElements
        .filter((name) => name.match(/^heading[1-6]$/))
        .forEach((commandValue) => {
          const level = commandValue[7];
          const pattern = new RegExp(`^(#{${level}})\\s$`);

          new BlockAutoformatEditing(this.editor, pattern, () => {
            if (!command.isEnabled) return;
            this.editor.execute('heading', { value: commandValue });
          });
        });
    }
  }

  addBlockQuoteAutoformats() {
    if (this.editor.commands.get('blockQuote')) {
      new BlockAutoformatEditing(this.editor, /^>\s$/, 'blockQuote');
    }
  }

  addCodeBlockAutoformats() {
    if (this.editor.commands.get('codeBlock')) {
      new BlockAutoformatEditing(this.editor, /^```$/, 'codeBlock');
    }
  }
}

function getCallbackFunctionForInlineAutoformat(editor, attributeKey) {
  return (writer, rangesToFormat) => {
    const command = editor.commands.get(attributeKey);
    if (!command.isEnabled) return;

    const validRanges = editor.model.schema.getValidRanges(rangesToFormat, attributeKey);

    let result = validRanges.next();
    while (!result.done) {
      writer.setAttribute(attributeKey, true, result.value);
      result = validRanges.next();
    }

    writer.removeSelectionAttribute(attributeKey);
  };
}
