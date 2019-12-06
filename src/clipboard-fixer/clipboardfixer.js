import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

export default class ClipboardFixer extends Plugin {
  init() {
    this.clipboard = this.editor.plugins.get(Clipboard);
    this.fixPlainTextLineBreak();
  }

  fixPlainTextLineBreak() {
    const { view } = this.editor.editing;
    const viewDocument = view.document;

    this.listenTo(viewDocument, 'clipboardInput', (e, { dataTransfer }) => {
      let content = dataTransfer.getData('text/plain');
      if (!content) return;

      content = plainTextToHtml(content);
      // eslint-disable-next-line no-underscore-dangle
      content = this.clipboard._htmlDataProcessor.toView(content);
      this.clipboard.fire('inputTransformation', { content, dataTransfer });
      view.scrollToTheSelection();
      e.stop();
    }, { priority: -999 }); // priority should between normal and low
  }
}

function plainTextToHtml(text) {
  let result = text
    // Encode <>.
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Creates paragraphs for every line breaks.
    .replace(/\r\n/g, '</p><p>')
    .replace(/\r/g, '</p><p>')
    .replace(/\n/g, '</p><p>')
    // Preserve trailing spaces (only the first and last one – the rest is handled below).
    .replace(/^\s/, '&nbsp;')
    .replace(/\s$/, '&nbsp;')
    // Preserve other subsequent spaces now.
    .replace(/\s\s/g, ' &nbsp;');

  if (result.indexOf('</p><p>') > -1) {
    // If we created paragraphs above, add the trailing ones.
    result = `<p>${result}</p>`;
  }

  return result;
}
