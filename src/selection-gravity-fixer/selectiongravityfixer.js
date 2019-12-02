import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SelectionGravityFixer extends Plugin {
  init() {
    this.definePostFixer();
  }

  definePostFixer() {
    const Attributes = ['linkHref'];
    const { editor } = this;
    const { document } = editor.model;

    document.registerPostFixer((writer) => {
      if (editor.state !== 'ready') return false;

      const changes = document.differ.getChanges();
      return changes.some((change) => {
        if (change.type === 'insert' && change.name === '$text') {
          const node = change.position.nodeAfter;
          if (node && Attributes.some((attr) => node.getAttribute(attr))) {
            writer.overrideSelectionGravity();
          }
        }
        return false;
      });
    });
  }
}
