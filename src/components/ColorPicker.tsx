import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Palette } from 'lucide-react'
import { NOTE_COLORS } from '@/types'
import type { NoteColor } from '@/types'
import { IconButton } from './ui/Button'
import { prefersDark } from '@/utils/helpers'

interface ColorPickerProps {
  value: NoteColor
  onChange: (color: NoteColor) => void
}

const PICKER_WIDTH = 252

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const wrapperRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const dark = prefersDark()

  function handleToggle() {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setPos({
        // Align right edge of picker with right edge of button, clamped to viewport
        x: Math.max(8, Math.min(rect.right - PICKER_WIDTH, window.innerWidth - PICKER_WIDTH - 8)),
        y: rect.bottom + 6,
      })
    }
    setIsOpen(true)
  }

  useEffect(() => {
    if (!isOpen) return
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        !pickerRef.current?.contains(target) &&
        !wrapperRef.current?.contains(target)
      ) {
        setIsOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  const colors = Object.entries(NOTE_COLORS) as [NoteColor, (typeof NOTE_COLORS)[NoteColor]][]

  return (
    <div ref={wrapperRef}>
      <IconButton
        onClick={handleToggle}
        active={isOpen}
        title="Change color"
        aria-label="Change note color"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Palette size={15} />
      </IconButton>

      {isOpen &&
        createPortal(
          <div
            ref={pickerRef}
            className="fixed z-[500] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl p-3 animate-scale-in"
            style={{ left: pos.x, top: pos.y, width: PICKER_WIDTH }}
            role="dialog"
            aria-label="Choose note color"
          >
            <div className="grid grid-cols-5 gap-2">
              {colors.map(([colorKey, theme]) => {
                const bg = dark ? theme.darkBg : theme.lightBg
                const border = dark ? theme.darkBorder : theme.lightBorder
                const isSelected = value === colorKey

                return (
                  <button
                    key={colorKey}
                    onClick={() => {
                      onChange(colorKey)
                      setIsOpen(false)
                    }}
                    title={theme.label}
                    aria-label={`${theme.label}${isSelected ? ' (selected)' : ''}`}
                    aria-pressed={isSelected}
                    className="flex flex-col items-center gap-1.5 focus-visible:outline-none group"
                  >
                    <span
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 group-focus-visible:scale-110"
                      style={{
                        backgroundColor: bg,
                        border: `2.5px solid ${isSelected ? theme.dot : border}`,
                        outline: isSelected ? `2px solid ${theme.dot}` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {isSelected && (
                        <svg
                          viewBox="0 0 10 10"
                          width="11"
                          height="11"
                          fill="none"
                          stroke={theme.dot}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="1.5,5 4,7.5 8.5,2.5" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[10px] leading-none text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {theme.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
