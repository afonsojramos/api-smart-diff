import { jsonSchemaTypes, jsonSchemaTypeProps, jsonSchemaValidators } from "./jsonSchema.consts"
import { ClassifyRule, DiffType, DiffTypeClassifier } from "../types"
import { JsonSchemaNodeType } from "./jsonSchema.types"
import { breaking, nonBreaking } from "../constants"
import { JsonPath } from "json-crawl"

export function isAllOfNode(value: any): value is { allOf: any[] } {
  return value && value.allOf && Array.isArray(value.allOf)
}

export const isValidType = (maybeType: unknown): maybeType is JsonSchemaNodeType =>
  typeof maybeType === "string" && jsonSchemaTypes.includes(maybeType as JsonSchemaNodeType)

export function inferTypes(fragment: unknown): JsonSchemaNodeType[] {
  if (typeof fragment !== 'object' || !fragment) { return [] }

  const types: JsonSchemaNodeType[] = []
  for (const type of Object.keys(jsonSchemaTypeProps) as JsonSchemaNodeType[]) {
    if (type === "integer") { continue }
    const props = jsonSchemaValidators[type]
    for (const prop of props) {
      if (prop in fragment) {
        types.push(type)
        break
      }
    }
  }
  return types
}

export function unwrapStringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

export function unwrapArrayOrNull(value: unknown): unknown[] | null {
  return Array.isArray(value) ? value : null
}


export const breakingIf = (v: boolean): DiffType => (v ? breaking : nonBreaking)
export const breakingIfAfterTrue: DiffTypeClassifier = ({ after }): DiffType => breakingIf(!!after.value)

export const maxClassifier: ClassifyRule = [
  breaking, 
  nonBreaking, 
  ({ before, after }) => breakingIf(before.value > after.value)
]

export const minClassifier: ClassifyRule = [
  breaking,
  nonBreaking,
  ({ before, after }) => breakingIf(before.value < after.value)
]

export const exclusiveClassifier: ClassifyRule = [
  breakingIfAfterTrue, 
  nonBreaking, 
  breakingIfAfterTrue
]

export const booleanClassifier: ClassifyRule = [
  breakingIfAfterTrue,
  nonBreaking,
  breakingIfAfterTrue
]

export const multipleOfClassifier: ClassifyRule = [
  breaking,
  nonBreaking,
  ({ before, after }) => breakingIf(!!(before.value % after.value))
]

export const buildPath = (path: JsonPath): string => {
  return "/" + path.map((i) => String(i).replace(new RegExp("/", "g"), "~1")).join("/")
}