"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { GripVertical, Key, MoreHorizontal, Trash2, ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DynamicTooltip } from "@/components/ui/tooltip"
import type { ColumnFieldProps, IDialectDataType } from "./types"
import { isOptionAvailable } from "./types"

const filterDataTypes = (types: IDialectDataType[], q: string) => {
  if (!q) return types
  const lower = q.toLowerCase()
  return types.filter(
    (dt) =>
      dt.sqlType.toLowerCase().includes(lower) ||
      dt.canonicalType?.name?.toLowerCase().includes(lower)
  )
}

export function ColumnField({
  column,
  dataTypes,
  dialectSlug = "postgres",
  onUpdate,
  onDelete,
  isNew = false,
}: ColumnFieldProps) {
  const [typeOpen, setTypeOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isNew) nameInputRef.current?.select()
  }, [isNew])

  const selectedType = dataTypes.find((dt) => dt.id === column.dataTypeId)

  const uniqueTypes = useMemo(() => {
    const filtered = filterDataTypes(dataTypes, searchQuery)
    const seen = new Set<string>()
    return filtered
      .filter((dt) => {
        const key = dt.sqlType.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => a.sqlType.toLowerCase().localeCompare(b.sqlType.toLowerCase()))
  }, [dataTypes, searchQuery])

  const typeDisplay = useMemo(() => {
    const base = (selectedType?.sqlType || "int").toLowerCase()
    if (column.length) return `${base}(${column.length})`
    if (column.precision)
      return `${base}(${column.precision}${column.scale ? `,${column.scale}` : ""})`
    return base
  }, [selectedType, column.length, column.precision, column.scale])

  const toggleOptions = [
    { key: "isUnique", label: "Unique" },
    { key: "isAutoIncrement", label: "Auto Inc." },
    { key: "isUnsigned", label: "Unsigned" },
    { key: "isArray", label: "Array" },
    { key: "isUpdatedAt", label: "Auto Update" },
  ].filter((opt) =>
    isOptionAvailable(opt.key, dialectSlug, selectedType?.canonicalType?.name)
  )

  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-200">
      <button className="cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100 touch-none transition-opacity">
        <GripVertical className="size-3.5 text-muted-foreground" />
      </button>

      <Input
        ref={nameInputRef}
        value={column.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        className="h-8 flex-1 min-w-24 max-w-32 font-mono text-xs bg-transparent border-0 shadow-none focus-visible:ring-1 focus-visible:ring-ring/50 px-2"
        placeholder="column_name"
      />

      <Popover open={typeOpen} onOpenChange={setTypeOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 px-3 font-mono text-xs text-muted-foreground hover:text-foreground gap-1 rounded-md"
          >
            <span className="truncate max-w-20">{typeDisplay}</span>
            <ChevronDown className="size-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-popover/95 backdrop-blur-md" align="start">
          <div className="p-3 border-b border-border/50">
            <Input
              placeholder="Search types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
              autoFocus
            />
          </div>
          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 gap-1.5 p-3">
              {uniqueTypes.map((dt) => {
                const isSelected =
                  selectedType?.sqlType.toLowerCase() === dt.sqlType.toLowerCase()
                return (
                  <button
                    key={dt.sqlType.toLowerCase()}
                    onClick={() => {
                      onUpdate({ dataTypeId: dt.id })
                      setTypeOpen(false)
                      setSearchQuery("")
                    }}
                    className={cn(
                      "group/type px-3 py-2.5 text-xs font-mono rounded-lg text-left transition-all flex items-center justify-between gap-2",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-accent/80 bg-muted/30"
                    )}
                  >
                    <span className="truncate">{dt.sqlType.toLowerCase()}</span>
                    <DynamicTooltip
                      trigger={
                        <Info
                          className={cn(
                            "size-3.5 shrink-0 cursor-help transition-opacity",
                            isSelected
                              ? "text-primary-foreground/70"
                              : "opacity-40 group-hover/type:opacity-70"
                          )}
                        />
                      }
                      text={dt.canonicalType?.description || "SQL data type"}
                    />
                  </button>
                )
              })}
              {!uniqueTypes.length && (
                <div className="col-span-2 py-12 text-center text-sm text-muted-foreground">
                  No matching types
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <DynamicTooltip
        trigger={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ isNullable: !column.isNullable })}
            className={cn(
              "h-7 w-7 p-0 text-[10px] font-bold rounded-md transition-all",
              column.isNullable
                ? "text-emerald-600 bg-emerald-500/15 hover:bg-emerald-500/25 dark:text-emerald-400"
                : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted"
            )}
          >
            N
          </Button>
        }
        text={column.isNullable ? "Nullable" : "Not Nullable"}
      />

      <DynamicTooltip
        trigger={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ isPrimaryKey: !column.isPrimaryKey })}
            className={cn(
              "h-7 w-7 p-0 rounded-md transition-all",
              column.isPrimaryKey
                ? "text-amber-500 bg-amber-500/15 hover:bg-amber-500/25"
                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
            )}
          >
            <Key className="size-3.5" />
          </Button>
        }
        text={column.isPrimaryKey ? "Primary Key" : "Set as Primary Key"}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 bg-popover/95 backdrop-blur-md">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Column Options
          </DropdownMenuLabel>

          {toggleOptions.length > 0 && (
            <div className="grid grid-cols-2 gap-3 px-3 py-3 border-y border-border/50 bg-muted/20">
              {toggleOptions.map((opt) => (
                <div key={opt.key} className="flex items-center justify-between gap-2">
                  <Label className="text-xs">{opt.label}</Label>
                  <Switch
                    checked={column[opt.key as keyof typeof column] as boolean}
                    onCheckedChange={(v) => onUpdate({ [opt.key]: v })}
                    className="scale-90"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 p-3">
            {[
              { key: "defaultValue", label: "Default", placeholder: "NULL", type: "text" },
              { key: "length", label: "Length", placeholder: "255", type: "number" },
              { key: "precision", label: "Precision", placeholder: "10", type: "number" },
              { key: "scale", label: "Scale", placeholder: "2", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {field.label}
                </Label>
                <Input
                  type={field.type}
                  value={(column[field.key as keyof typeof column] as string | number) ?? ""}
                  onChange={(e) =>
                    onUpdate({
                      [field.key]:
                        field.type === "number"
                          ? e.target.value
                            ? parseInt(e.target.value)
                            : null
                          : e.target.value || null,
                    })
                  }
                  placeholder={field.placeholder}
                  className="h-8 text-xs mt-1 font-mono"
                />
              </div>
            ))}
          </div>

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                Delete Column
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
