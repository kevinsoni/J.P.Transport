'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteConfirmationDialogProps {
  itemName: string
  itemType: string
  onConfirm: () => void | Promise<void>
  disabled?: boolean
}

export function DeleteConfirmationDialog({
  itemName,
  itemType,
  onConfirm,
  disabled = false
}: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm()
      setIsOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (isDeleting) return
    setError(null)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="relative bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-2">
              Delete {itemType}
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemName}"? This action cannot be undone.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirm}
                loading={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}