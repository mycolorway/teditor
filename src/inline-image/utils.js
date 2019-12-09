
export function insertImage(writer, model, attributes = {}) {
  const imageElement = writer.createElement('image', attributes);
  model.insertContent(imageElement);
  writer.setSelection(imageElement, 'after');
}

export function isImageAllowed(model) {
  const { schema } = model;
  const { selection } = model.document;

  return isImageAllowedInParent(selection, schema)
    && !checkSelectionOnObject(selection, schema)
    && isInOtherImage(selection);
}

function isImageAllowedInParent(selection, schema) {
  const parent = getInsertImageParent(selection);

  return schema.checkChild(parent, 'image');
}

function checkSelectionOnObject(selection, schema) {
  const selectedElement = selection.getSelectedElement();

  return selectedElement && schema.isObject(selectedElement);
}

function isInOtherImage(selection) {
  return [...selection.focus.getAncestors()].every((ancestor) => !ancestor.is('image'));
}

function getInsertImageParent(selection) {
  const { parent } = selection.focus;

  if (parent.isEmpty && !parent.is('$root')) {
    return parent.parent;
  }

  return parent;
}
