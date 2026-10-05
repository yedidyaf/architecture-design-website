import {useCallback} from 'react'
import {isKeySegment, type InputProps, type Path, type PortableTextInputProps} from 'sanity'

type OnPathFocus = PortableTextInputProps['onPathFocus']

/**
 * Keeps the edit dialog of a body block object (contentImage / beforeAfter)
 * open while it's being edited.
 *
 * Every change to the block (a caption keystroke, an image upload) syncs back
 * into the Portable Text editor as a `set_node`, and the editor re-emits its
 * current selection on every Slate `onChange`. That selection still sits on
 * the block object itself, so Studio receives `onPathFocus([{_key}])`. Its
 * focus handler then sets openPath = focusPath.slice(0, -1) = the body field,
 * which closes the block's dialog.
 *
 * We drop exactly that echo: a focus on the block object while focus is
 * already inside that same block (i.e. on one of its fields in the dialog).
 */
function isSelectionEcho(next: Path, current: Path): boolean {
  if (next.length !== 1 || current.length < 2) return false
  const [nextSeg] = next
  const [currentSeg] = current
  return isKeySegment(nextSeg) && isKeySegment(currentSeg) && nextSeg._key === currentSeg._key
}

// Typed against the generic InputProps so it fits `components.input` on an
// array field; `body` is always a Portable Text array, so narrow here.
export function BodyInput(inputProps: InputProps) {
  const props = inputProps as PortableTextInputProps
  const {focusPath, onPathFocus} = props

  const handlePathFocus = useCallback<OnPathFocus>(
    (path, payload) => {
      if (isSelectionEcho(path, focusPath)) return
      onPathFocus(path, payload)
    },
    [focusPath, onPathFocus],
  )

  return props.renderDefault({...props, onPathFocus: handlePathFocus})
}
