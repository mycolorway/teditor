import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class SelectionGravityFixer extends Plugin {
  init() {
    const Attributes = ['linkHref'];
    const { model } = this.editor;
    const { selection } = model.document;

    this.listenTo(selection, 'change:range', () => {
      const needOverridden = Attributes
        .some((attr) => isAtEndBoundary(selection.getFirstPosition(), attr));

      if (needOverridden) {
        model.change((writer) => {
          if (!this.isGravityOverridden) {
            this.overrideUid = writer.overrideSelectionGravity();
          }
        });
      } else if (this.isGravityOverridden) {
        model.change((writer) => {
          writer.restoreSelectionGravity(this.overrideUid);
          this.overrideUid = null;
        });
      }
    });
  }

  get isGravityOverridden() {
    return !!this.overrideUid;
  }
}

function isAtEndBoundary(position, attribute) {
  const { nodeBefore, nodeAfter } = position;
  const isAttrBefore = nodeBefore ? nodeBefore.hasAttribute(attribute) : false;
  const isAttrAfter = nodeAfter ? nodeAfter.hasAttribute(attribute) : false;

  return (
    isAttrBefore
    && (!isAttrAfter
      || nodeBefore.getAttribute(attribute) !== nodeAfter.getAttribute(attribute))
  );
}
