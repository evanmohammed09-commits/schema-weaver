// Schema editor types - using generic types to avoid external dependencies

export interface CanonicalType {
  name?: string
  description?: string
}

export interface IDialectDataType {
  id: string
  sqlType: string
  canonicalType?: CanonicalType
}

export interface ColumnData {
  localId?: string
  id?: string | number
  name: string
  dataTypeId: string
  isNullable?: boolean
  isPrimaryKey?: boolean
  isUnique?: boolean
  isAutoIncrement?: boolean
  isUnsigned?: boolean
  isArray?: boolean
  isUpdatedAt?: boolean
  defaultValue?: string | null
  length?: number | null
  precision?: number | null
  scale?: number | null
}

export interface IndexColumn {
  columnName: string
  sortOrder: "Asc" | "Desc"
  length: number | null
}

export interface IndexData {
  localId?: string
  id?: string | number
  type?: string
  algorithm?: string | null
  indexColumns?: IndexColumn[]
}

export interface ColumnFieldProps {
  column: ColumnData
  dataTypes: IDialectDataType[]
  dialectSlug?: string
  onUpdate: (updates: Partial<ColumnData>) => void
  onDelete?: () => void
  isNew?: boolean
}

export interface IndexFieldProps {
  index: IndexData
  columns?: { name: string; localId?: string }[]
  dialectSlug?: string
  onUpdate?: (updates: Partial<IndexData>) => void
  onDelete?: () => void
}

export interface FieldsListProps {
  columns: ColumnData[]
  dataTypes: IDialectDataType[]
  dialectSlug?: string
  onUpdateColumn: (localId: string, updates: Partial<ColumnData>) => void
  onDeleteColumn: (localId: string) => void
  newColumnId?: string | null
}

// Index compatibility helpers
export const INDEX_TYPES = ["STANDARD", "PRIMARY_KEY", "UNIQUE", "FULLTEXT", "SPATIAL"] as const
export const ALGORITHMS = ["BTREE", "HASH", "GIN", "GIST", "BRIN"] as const

export const getAvailableIndexTypes = (dialect: string) => {
  const common = ["STANDARD", "PRIMARY_KEY", "UNIQUE"]
  if (dialect === "mysql") return [...common, "FULLTEXT", "SPATIAL"]
  if (dialect === "postgres") return [...common, "GIN", "GIST"]
  return common
}

export const getAvailableAlgorithms = (dialect: string) => {
  if (dialect === "mysql") return ["BTREE", "HASH"]
  if (dialect === "postgres") return ["BTREE", "HASH", "GIN", "GIST", "BRIN"]
  return ["BTREE"]
}

export const shouldShowAlgorithm = (dialect: string) => 
  ["mysql", "postgres"].includes(dialect)

// Column compatibility helpers
export const isOptionAvailable = (
  option: string,
  dialect: string,
  typeName?: string
): boolean => {
  const numericTypes = ["integer", "bigint", "smallint", "int", "serial", "bigserial"]
  const isNumeric = typeName ? numericTypes.includes(typeName.toLowerCase()) : false
  const isTimestamp = typeName?.toLowerCase().includes("timestamp") || false

  switch (option) {
    case "isUnique":
      return true
    case "isAutoIncrement":
      return isNumeric && ["mysql", "sqlite"].includes(dialect)
    case "isUnsigned":
      return isNumeric && dialect === "mysql"
    case "isArray":
      return dialect === "postgres"
    case "isUpdatedAt":
      return isTimestamp
    default:
      return false
  }
}
