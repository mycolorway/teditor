
export function isCodeBlockSelected(selection) {
  const firstPosition = selection.getFirstPosition();
  const lastPosition = selection.getLastPosition();
  const { nodeAfter } = firstPosition;
  const { nodeBefore } = lastPosition;

  if (nodeAfter && nodeBefore && nodeAfter === nodeBefore && firstPosition.nodeAfter.is('element', 'codeBlock')) {
    return firstPosition.nodeAfter;
  }

  return false;
}

export function getCodeBlockValue(viewElement) {
  const value = [];
  if (viewElement.hasAttribute('data-value')) {
    value.push(viewElement.getAttribute('data-value'));
  } else {
    viewElement.getChildren().forEach((node) => {
      if (node.is('text')) {
        value.push(node.data);
      } else if (node.childCount > 0) {
        value.push(getCodeBlockValue(node));
      }
    });
  }
  return value.join('\n');
}

function commandForceDisable(evt) {
  // eslint-disable-next-line no-param-reassign
  evt.return = false;
  evt.stop();
}

export function disableCommand(cmd) {
  cmd.on('set:isEnabled', commandForceDisable, { priority: 'highest' });

  // eslint-disable-next-line no-param-reassign
  cmd.isEnabled = false;
}

export function enableCommand(cmd) {
  cmd.off('set:isEnabled', commandForceDisable);
  cmd.refresh();
}
