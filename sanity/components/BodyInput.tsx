import {useCallback} from 'react'
import {isKeySegment, type InputProps, type Path, type PortableTextInputProps} from 'sanity'

type OnPathFocus = PortableTextInputProps['onPathFocus']
type Members = PortableTextInputProps['members']

/**
 * Keeps the edit dialog of a body block object (contentImage / beforeAfter)
 * open while it's being edited.
 *
 * Every change to the block (a caption keystroke, an image upload's progress
 * patches) syncs back into the Portable Text editor as a `set_node`, and the
 * editor re-emits its current selection on every Slate `onChange`. That
 * selection still sits on the block object itself, so Studio receives
 * `onPathFocus([{_key}])`. Its focus handler then sets
 * openPath = focusPath.slice(0, -1) = the body field, which closes the dialog.
 *
 * Closing the dialog mid-upload unmounts the image input, and its uploader
 * aborts on unmount. The upload then never finishes (spinner stuck on
 * `_upload`, or the image just missing).
 *
 * We drop exactly that echo: a focus on a block object whose dialog is open.
 * The guard keys off the block's `open` state, not the focus path. Picking a
 * file blurs the form, and blur resets focusPath to [] while leaving
 * openPath alone. A focus-based guard would let the echo through right then.
 */
function isSelectionEcho(next: Path, members: Members): boolean {
  if (next.length !== 1) return false
  const [segment] = next
  if (!isKeySegment(segment)) return false
  return members.some(
    (member) => member.kind === 'item' && member.key === segment._key && member.open,
  )
}

// Typed against the generic InputProps so it fits `components.input` on an
// array field; `body` is always a Portable Text array, so narrow here.
export function BodyInput(inputProps: InputProps) {
  const props = inputProps as PortableTextInputProps
  const {members, onPathFocus} = props

  const handlePathFocus = useCallback<OnPathFocus>(
    (path, payload) => {
      if (isSelectionEcho(path, members)) return
      onPathFocus(path, payload)
    },
    [members, onPathFocus],
  )

  // Only onPathFocus is wrapped; onChange, members and renderers pass through.
  return props.renderDefault({...props, onPathFocus: handlePathFocus})
}
