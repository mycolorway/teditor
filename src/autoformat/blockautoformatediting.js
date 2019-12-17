import LiveRange from '@ckeditor/ckeditor5-engine/src/model/liverange';

export default class BlockAutoformatEditing {
  static get pluginName() {
    return 'BlockAutoformatEditing';
  }

  constructor(editor, pattern, callbackOrCommand) {
    let callback;
    let command = null;

    if (typeof callbackOrCommand === 'function') {
      callback = callbackOrCommand;
    } else {
      command = editor.commands.get(callbackOrCommand);

      callback = () => {
        editor.execute(callbackOrCommand);
      };
    }

    const viewDocument = editor.editing.view.document;
    editor.model.document.on('change', (evt, batch) => {
      if (viewDocument.isComposing) return;

      if (command && !command.isEnabled) {
        return;
      }

      if (batch.type === 'transparent') {
        return;
      }

      const changes = Array.from(editor.model.document.differ.getChanges());
      const entry = changes[0];

      if (changes.length !== 1 || entry.type !== 'insert' || entry.name !== '$text' || entry.length !== 1) {
        return;
      }

      const blockToFormat = entry.position.parent;

      if (!blockToFormat.is('paragraph') || blockToFormat.childCount !== 1) {
        return;
      }

      const match = pattern.exec(blockToFormat.getChild(0).data);

      if (!match) {
        return;
      }

      editor.model.enqueueChange((writer) => {
        const start = writer.createPositionAt(blockToFormat, 0);
        const end = writer.createPositionAt(blockToFormat, match[0].length);
        const range = new LiveRange(start, end);

        const wasChanged = callback({ match });

        if (wasChanged !== false) {
          writer.remove(range);
        }

        range.detach();
      });
    });
  }
}
