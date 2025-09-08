'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteConfirmationDialogProps {
  itemName: string
  itemType: string
  onConfirm: () => void
  disabled?: boolean
}

export function DeleteConfirmationDialog({
  itemName,
  itemType,
  onConfirm,
  disabled = false
}: DeleteConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setIsOpen(false)
  }

  const handleCancel = () => {
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
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleConfirm}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}