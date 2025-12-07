"use client"

import { useState, useMemo } from "react"
import { GripVertical, MoreHorizontal, Trash2, X, Check, Database, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DynamicTooltip } from "@/components/ui/tooltip"
import { getIndexTypeIcon, getAlgorithmIcon, getIndexTypeStyle } from "./field-icons"
import type { IndexFieldProps } from "./types"
import { getAvailableIndexTypes, getAvailableAlgorithms, shouldShowAlgorithm } from "./types"

export function IndexField({
  index,
  columns = [],
  dialectSlug = "postgres",
  onUpdate,
  onDelete,
}: IndexFieldProps) {
  const [columnSelectorOpen, setColumnSelectorOpen] = useState(false)

  const availableTypes = useMemo(() => getAvailableIndexTypes(dialectSlug), [dialectSlug])
  const availableAlgorithms = useMemo(() => getAvailableAlgorithms(dialectSlug), [dialectSlug])
  const showAlgorithm = shouldShowAlgorithm(dialectSlug)

  const indexColumns = index.indexColumns || []
  const selectedColumns = indexColumns.map((ic) => ic.columnName)
  const currentType = index.type || "STANDARD"

  const TypeIcon = getIndexTypeIcon(currentType)
  const AlgoIcon = showAlgorithm && index.algorithm ? getAlgorithmIcon(index.algorithm) : null

  const updateColumns = (newColumns: string[]) => {
    onUpdate?.({
      indexColumns: newColumns.map((name) => ({
        columnName: name,
        sortOrder: "Asc" as const,
        length: null,
      })),
    })
  }

  const toggleColumn = (e: React.MouseEvent, columnName: string) => {
    e.preventDefault()
    e.stopPropagation()
    const isSelected = selectedColumns.includes(columnName)
    updateColumns(
      isSelected
        ? selectedColumns.filter((c) => c !== columnName)
        : [...selectedColumns, columnName]
    )
  }

  const removeColumn = (e: React.MouseEvent, columnName: string) => {
    e.preventDefault()
    e.stopPropagation()
    updateColumns(selectedColumns.filter((c) => c !== columnName))
  }

  return (
    <div className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-200">
      <button className="cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100 touch-none transition-opacity">
        <GripVertical className="size-3.5 text-muted-foreground" />
      </button>

      <DynamicTooltip
        trigger={
          <div
            className={cn(
              "size-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
              getIndexTypeStyle(currentType)
            )}
          >
            <TypeIcon className="size-4" />
          </div>
        }
        text={`${currentType.toLowerCase().replace("_", " ")} index`}
        className="capitalize"
      />

      <Popover open={columnSelectorOpen} onOpenChange={setColumnSelectorOpen}>
        <PopoverTrigger asChild>
          <button className="flex-1 flex items-center gap-1.5 min-w-0 h-9 px-2 rounded-md bg-muted/40 hover:bg-accent/50 ring-1 ring-transparent hover:ring-border/50 transition-all cursor-pointer overflow-hidden text-left">
            {selectedColumns.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedColumns.map((col) => (
                  <span
                    key={col}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded-md text-xs font-mono shadow-sm"
                  >
                    {col}
                    <button
                      onClick={(e) => removeColumn(e, col)}
                      className="opacity-60 hover:opacity-100 hover:bg-primary/20 rounded-sm p-0.5 transition-all"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Select columns...</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-60 p-0 bg-popover/95 backdrop-blur-md"
          align="start"
          sideOffset={4}
        >
          <div className="px-3 py-2.5 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <span className="text-xs font-medium">Included Columns</span>
            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 bg-muted rounded">
              {selectedColumns.length} selected
            </span>
          </div>
          <ScrollArea className="h-52 p-1.5">
            {columns.length > 0 ? (
              <div className="space-y-1">
                {columns.map((col) => {
                  const isSelected = selectedColumns.includes(col.name)
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={(e) => toggleColumn(e, col.name)}
                      className={cn(
                        "flex items-center gap-3 w-full px-2.5 py-2 rounded-md text-left transition-all",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-accent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "size-4 rounded border flex items-center justify-center transition-all shrink-0",
                          isSelected
                            ? "bg-primary border-primary shadow-sm"
                            : "border-muted-foreground/30 bg-background"
                        )}
                      >
                        {isSelected && (
                          <Check className="size-2.5 text-primary-foreground stroke-[3]" />
                        )}
                      </div>
                      <span className={cn("font-mono text-xs", isSelected && "font-medium")}>
                        {col.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Database className="size-10 text-muted-foreground/20 mb-3" />
                <p className="text-xs text-muted-foreground">No columns in table</p>
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {AlgoIcon && (
        <DynamicTooltip
          trigger={
            <div className="size-7 rounded-md flex items-center justify-center bg-muted/50 text-muted-foreground border border-border/50">
              <AlgoIcon className="size-4" />
            </div>
          }
          text={index.algorithm || ""}
          className="font-mono text-xs"
        />
      )}

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
        <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-md">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Index Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <TypeIcon className="size-4" />
              <span>Type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {availableTypes.length > 0 ? (
                <DropdownMenuRadioGroup
                  value={currentType}
                  onValueChange={(value) => onUpdate?.({ type: value })}
                >
                  {availableTypes.map((type) => {
                    const Icon = getIndexTypeIcon(type)
                    return (
                      <DropdownMenuRadioItem key={type} value={type} className="gap-2 capitalize">
                        <Icon className="size-3.5 opacity-70" />
                        {type.toLowerCase().replace("_", " ")}
                      </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              ) : (
                <div className="p-2 text-xs text-muted-foreground">No types available</div>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {showAlgorithm && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <List className="size-4" />
                <span>Algorithm</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                {availableAlgorithms.length > 0 ? (
                  <DropdownMenuRadioGroup
                    value={index.algorithm || ""}
                    onValueChange={(value) => onUpdate?.({ algorithm: value || null })}
                  >
                    <DropdownMenuRadioItem value="">Default</DropdownMenuRadioItem>
                    {availableAlgorithms.map((algo) => {
                      const Icon = getAlgorithmIcon(algo)
                      return (
                        <DropdownMenuRadioItem key={algo} value={algo} className="gap-2">
                          <Icon className="size-3.5 opacity-70" />
                          {algo}
                        </DropdownMenuRadioItem>
                      )
                    })}
                  </DropdownMenuRadioGroup>
                ) : (
                  <div className="p-2 text-xs text-muted-foreground">No algorithms available</div>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive gap-2"
                onClick={onDelete}
              >
                <Trash2 className="size-4" />
                Delete Index
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
