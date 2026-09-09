'use client'

import { useEffect, useRef } from 'react'

/**
 * Custom hook to detect clicks outside a referenced DOM element.
 * Useful for closing dropdowns, popovers, select menus, and modal dialogs.
 * 
 * @param callback Function to call when a click outside the element occurs
 * @param enabled Whether the outside click listener is active (default: true)
 */
export function useOutsideClick<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null)
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        savedCallback.current()
      }
    }

    // Capture mousedown and touchstart to handle mobile and desktop
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [enabled])

  return ref
}
