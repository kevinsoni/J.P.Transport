'use client'

import Link from 'next/link'
import { Eye, Edit } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'

interface RowActionsProps {
  viewHref: string
  editHref: string
  itemName: string
  itemType: string
  onDelete: () => void | Promise<void>
}

/** Shared, highlighted View / Edit / Delete action buttons used across all data tables. */
export function RowActions({ viewHref, editHref, itemName, itemType, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
        aria-label={`View ${itemType}`}
        title="View"
      >
        <Link href={viewHref}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
        aria-label={`Edit ${itemType}`}
        title="Edit"
      >
        <Link href={editHref}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <DeleteConfirmationDialog
        itemName={itemName}
        itemType={itemType}
        className="h-8 w-8 rounded-lg bg-red-50 p-0 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
        onConfirm={onDelete}
      />
    </div>
  )
}
