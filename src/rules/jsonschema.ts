import { 
  addNonBreaking, allAnnotation, allBreaking, allUnclassified, breaking, 
  breakingIf, breakingIfAfterTrue, Classifier, nonBreaking, onlyAddBreaking, Rules
} from "../types"

const maxClassifier: Classifier = [
  breaking,
  nonBreaking,
  (b, a) => breakingIf(b < a)
]

const minClassifier: Classifier = [
  breaking,
  nonBreaking, 
  (b, a) => breakingIf(b > a)
]

const exclusiveClassifier: Classifier = [
  breakingIfAfterTrue, 
  nonBreaking,
  (b, a) => breakingIf(b < a)
]

const booleanClassifier: Classifier = [
  breakingIfAfterTrue,
  nonBreaking,
  breakingIfAfterTrue
]

const multipleOfClassifier: Classifier = [
  breaking,
  nonBreaking,
  (b, a) => breakingIf(!!(b % a))
]

export const jsonSchemaRules = (rootRule: Classifier = allUnclassified): Rules => ({
  "/": rootRule,
  "/title": allAnnotation,
  "/multipleOf": multipleOfClassifier,
  "/maximum": maxClassifier,
  "/exclusiveMaximum": exclusiveClassifier,
  "/minimum": minClassifier,
  "/exclusiveMinimum": exclusiveClassifier,
  "/maxLength": maxClassifier,
  "/minLength": minClassifier,
  "/pattern": [breaking, nonBreaking, breaking], // Regex.test before vs after ?
  "/maxItems": maxClassifier,
  "/minItems": minClassifier,
  "/uniqueItems": booleanClassifier,
  "/maxProperties": maxClassifier,
  "/minProperties": minClassifier,
  "/required": {
    '/': onlyAddBreaking,
    '/*': [breaking, nonBreaking, breaking]
  },
  "/enum": {
    "/": [breaking, nonBreaking, breaking],
    "/*": [nonBreaking, breaking, breaking]
  },
  "/type": [breaking, nonBreaking, breaking],
  "/not": {
    '/': [breaking, nonBreaking, breaking],
    '/*': () => jsonSchemaRules(allBreaking)    
  },
  "/allOf": {
    '/': [breaking, nonBreaking, breaking],
    '/*': () => jsonSchemaRules(allBreaking)
  },
  "/oneOf": {
    '/': [breaking, nonBreaking, breaking],
    '/*': () => jsonSchemaRules(addNonBreaking)
  },
  "/anyOf": {
    '/': [breaking, nonBreaking, breaking],
    '/*': () => jsonSchemaRules(addNonBreaking)
  },
  "/items": () => jsonSchemaRules(),
  "/properties": {
    "/": [breaking, nonBreaking, breaking],
    "/*": () => jsonSchemaRules(),
  },
  "/additionalProperties": {
    "/": [breaking, breaking, breakingIfAfterTrue],
    '/*': () => jsonSchemaRules(addNonBreaking)
  },
  "/description": allAnnotation,
  "/format": [breaking, nonBreaking, breaking],
  "/default": [nonBreaking, breaking, breaking],
  "/nullable": booleanClassifier,
  "/discriminator": { // TODO
    '/': allUnclassified,
    '/propertyName': allUnclassified,
    '/mapping': allUnclassified
  },
  "/readOnly": booleanClassifier,
  "/writeOnly": booleanClassifier,
  "/example": allAnnotation,
  "/externalDocs": allAnnotation,
  "/deprecated": booleanClassifier,
  "/xml": { // TODO
    '/': allUnclassified,
    "/name": allUnclassified,
    "/namespace": allUnclassified,
    "/prefix": allUnclassified,
    "/attribute": allUnclassified,
    "/wrapped": allUnclassified,
  },
})