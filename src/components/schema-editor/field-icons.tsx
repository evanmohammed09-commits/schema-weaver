import {
  Key,
  Fingerprint,
  Search,
  MapPin,
  List,
  Hash,
  Share2,
  Database,
} from "lucide-react"

export const INDEX_TYPE_ICONS = {
  PRIMARY_KEY: Key,
  UNIQUE: Fingerprint,
  FULLTEXT: Search,
  SPATIAL: MapPin,
  STANDARD: List,
} as const

export const ALGORITHM_ICONS = {
  BTREE: List,
  HASH: Hash,
  GIN: Share2,
  GIST: Share2,
  BRIN: Database,
} as const

export const getIndexTypeIcon = (type: string) =>
  INDEX_TYPE_ICONS[type as keyof typeof INDEX_TYPE_ICONS] || List

export const getAlgorithmIcon = (algo: string) =>
  ALGORITHM_ICONS[algo as keyof typeof ALGORITHM_ICONS] || List

export const INDEX_TYPE_STYLES = {
  PRIMARY_KEY: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  UNIQUE: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  FULLTEXT: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  SPATIAL: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  STANDARD: "bg-muted text-muted-foreground",
} as const

export const getIndexTypeStyle = (type: string) =>
  INDEX_TYPE_STYLES[type as keyof typeof INDEX_TYPE_STYLES] || INDEX_TYPE_STYLES.STANDARD
