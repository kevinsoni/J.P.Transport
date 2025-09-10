'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  name: string
}

interface SearchableSelectProps {
  options: Option[]
  value?: string
  placeholder: string
  onSelect: (value: string) => void
  onAddNew: (name: string, type: string) => Promise<string>
  partyType: string
  name: string
}

export function SearchableSelect({ 
  options, 
  value, 
  placeholder, 
  onSelect, 
  onAddNew, 
  partyType,
  name 
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find(opt => opt.id === value)
  const hasExactMatch = filteredOptions.some(opt => 
    opt.name.toLowerCase() === search.toLowerCase()
  )

  const allOptions = [...filteredOptions]
  if (search && !hasExactMatch) {
    allOptions.push({ id: 'add-new', name: `Add "${search}"` })
  }

  const handleAddNew = async () => {
    if (!search.trim()) return
    
    setIsAdding(true)
    try {
      const newId = await onAddNew(search.trim(), partyType)
      onSelect(newId)
      setSearch('')
      setOpen(false)
      setHighlightedIndex(-1)
    } catch (error) {
      console.error('Failed to add new party:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        setOpen(true)
        setHighlightedIndex(0)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : allOptions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
          const selectedOpt = allOptions[highlightedIndex]
          if (selectedOpt.id === 'add-new') {
            handleAddNew()
          } else {
            onSelect(selectedOpt.id)
            setOpen(false)
            setSearch('')
            setHighlightedIndex(-1)
          }
        }
        break
      case 'Escape':
        setOpen(false)
        setSearch('')
        setHighlightedIndex(-1)
        buttonRef.current?.focus()
        break
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <input type="hidden" name={name} value={value || ''} />
      
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
      >
        {selectedOption ? selectedOption.name : placeholder}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2">
            <Input
              ref={inputRef}
              placeholder="Search or type new name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setHighlightedIndex(0)
              }}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          
          <div className="max-h-60 overflow-auto">
            {allOptions.map((option, index) => (
              <button
                key={option.id}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left flex items-center",
                  highlightedIndex === index ? "bg-blue-100" : "hover:bg-gray-100",
                  option.id === 'add-new' ? "text-blue-600" : ""
                )}
                onClick={() => {
                  if (option.id === 'add-new') {
                    handleAddNew()
                  } else {
                    onSelect(option.id)
                    setOpen(false)
                    setSearch('')
                    setHighlightedIndex(-1)
                  }
                }}
                disabled={option.id === 'add-new' && isAdding}
              >
                {option.id === 'add-new' ? (
                  <Plus className="mr-2 h-4 w-4" />
                ) : (
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                )}
                {option.id === 'add-new' && isAdding ? 'Adding...' : option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}