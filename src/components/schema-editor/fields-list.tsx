"use client"

import { Database } from "lucide-react"
import { ColumnField } from "./column-field"
import type { FieldsListProps } from "./types"

export function FieldsList({
  columns,
  dataTypes,
  dialectSlug,
  onUpdateColumn,
  onDeleteColumn,
  newColumnId,
}: FieldsListProps) {
  if (!columns?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border/50 rounded-xl mx-2 my-2 bg-muted/20">
        <Database className="size-10 text-muted-foreground/25 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">No columns defined</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Add a column to start</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5 p-2">
      {columns.map((col) => {
        const id = col.localId || col.id?.toString()
        return (
          <ColumnField
            key={id}
            column={col}
            dataTypes={dataTypes}
            dialectSlug={dialectSlug}
            isNew={id === newColumnId}
            onUpdate={(u) => col.localId && onUpdateColumn(col.localId, u)}
            onDelete={col.localId ? () => onDeleteColumn(col.localId!) : undefined}
          />
        )
      })}
    </div>
  )
}
