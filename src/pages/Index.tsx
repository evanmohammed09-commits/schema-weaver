import { useState } from "react"
import { Plus } from "lucide-react"
import { ColumnField, IndexField, FieldsList } from "@/components/schema-editor"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { ColumnData, IndexData, IDialectDataType } from "@/components/schema-editor/types"

// Mock data types for demo
const mockDataTypes: IDialectDataType[] = [
  { id: "1", sqlType: "INTEGER", canonicalType: { name: "INT", description: "Standard integer type" } },
  { id: "2", sqlType: "VARCHAR", canonicalType: { name: "STRING", description: "Variable-length character string" } },
  { id: "3", sqlType: "TEXT", canonicalType: { name: "TEXT", description: "Large text content" } },
  { id: "4", sqlType: "BOOLEAN", canonicalType: { name: "BOOLEAN", description: "True/false value" } },
  { id: "5", sqlType: "TIMESTAMP", canonicalType: { name: "DATETIME", description: "Date and time" } },
  { id: "6", sqlType: "UUID", canonicalType: { name: "UUID", description: "Universally unique identifier" } },
  { id: "7", sqlType: "JSONB", canonicalType: { name: "JSON", description: "JSON data type" } },
  { id: "8", sqlType: "DECIMAL", canonicalType: { name: "DECIMAL", description: "Exact numeric with precision" } },
]

const Index = () => {
  const [columns, setColumns] = useState<ColumnData[]>([
    { localId: "1", name: "id", dataTypeId: "1", isPrimaryKey: true, isNullable: false },
    { localId: "2", name: "email", dataTypeId: "2", isPrimaryKey: false, isNullable: false, isUnique: true, length: 255 },
    { localId: "3", name: "name", dataTypeId: "2", isPrimaryKey: false, isNullable: true, length: 100 },
    { localId: "4", name: "created_at", dataTypeId: "5", isPrimaryKey: false, isNullable: false },
  ])

  const [indexes, setIndexes] = useState<IndexData[]>([
    { localId: "idx1", type: "PRIMARY_KEY", indexColumns: [{ columnName: "id", sortOrder: "Asc", length: null }] },
    { localId: "idx2", type: "UNIQUE", indexColumns: [{ columnName: "email", sortOrder: "Asc", length: null }], algorithm: "BTREE" },
  ])

  const [newColumnId, setNewColumnId] = useState<string | null>(null)

  const handleUpdateColumn = (localId: string, updates: Partial<ColumnData>) => {
    setColumns(cols => cols.map(c => c.localId === localId ? { ...c, ...updates } : c))
  }

  const handleDeleteColumn = (localId: string) => {
    setColumns(cols => cols.filter(c => c.localId !== localId))
  }

  const handleAddColumn = () => {
    const id = `col_${Date.now()}`
    setColumns(cols => [...cols, { localId: id, name: "", dataTypeId: "1", isPrimaryKey: false, isNullable: true }])
    setNewColumnId(id)
  }

  const handleUpdateIndex = (localId: string, updates: Partial<IndexData>) => {
    setIndexes(idxs => idxs.map(i => i.localId === localId ? { ...i, ...updates } : i))
  }

  const handleDeleteIndex = (localId: string) => {
    setIndexes(idxs => idxs.filter(i => i.localId !== localId))
  }

  const handleAddIndex = () => {
    const id = `idx_${Date.now()}`
    setIndexes(idxs => [...idxs, { localId: id, type: "STANDARD", indexColumns: [] }])
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Schema Editor</h1>
            <p className="text-muted-foreground">Beautiful, minimal database schema design</p>
          </div>

          {/* Columns Section */}
          <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div>
                <h2 className="font-semibold">Columns</h2>
                <p className="text-xs text-muted-foreground">{columns.length} columns defined</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddColumn} className="gap-1.5">
                <Plus className="size-3.5" />
                Add Column
              </Button>
            </div>
            <FieldsList
              columns={columns}
              dataTypes={mockDataTypes}
              dialectSlug="postgres"
              onUpdateColumn={handleUpdateColumn}
              onDeleteColumn={handleDeleteColumn}
              newColumnId={newColumnId}
            />
          </div>

          {/* Indexes Section */}
          <div className="rounded-xl border bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div>
                <h2 className="font-semibold">Indexes</h2>
                <p className="text-xs text-muted-foreground">{indexes.length} indexes configured</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleAddIndex} className="gap-1.5">
                <Plus className="size-3.5" />
                Add Index
              </Button>
            </div>
            <div className="space-y-1.5 p-2">
              {indexes.map(idx => (
                <IndexField
                  key={idx.localId}
                  index={idx}
                  columns={columns.map(c => ({ name: c.name, localId: c.localId }))}
                  dialectSlug="postgres"
                  onUpdate={(u) => idx.localId && handleUpdateIndex(idx.localId, u)}
                  onDelete={() => idx.localId && handleDeleteIndex(idx.localId)}
                />
              ))}
              {indexes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border/50 rounded-xl mx-2 my-2 bg-muted/20">
                  <p className="text-sm font-medium text-muted-foreground">No indexes defined</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add an index to optimize queries</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default Index
