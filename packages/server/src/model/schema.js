import util from 'util'
import { isObject, isArray, isString, asArray } from '@/utils'
import {
  Relation,
  BelongsToOneRelation,
  HasOneRelation,
  HasOneThroughRelation,
  HasManyRelation,
  ManyToManyRelation
} from 'objection'

export function convertSchema(schema, { isRoot, isItems } = { isRoot: true }) {
  if (isObject(schema)) {
    // Shallow clone so we can modify and return:
    schema = { ...schema }
    const { type } = schema
    if (isString(type)) {
      // Convert schema property notation to JSON schema
      if (jsonTypes[type]) {
        if (type === 'array') {
          const { items } = schema
          if (items) {
            schema.items = convertSchema(items, { isItems: true })
          }
        }
      } else if (['date', 'datetime', 'timestamp'].includes(type)) {
        // date properties can be submitted both as a string or a Date object.
        // Provide validation through date-time format, which in AJV appears
        // to handle both types correctly.
        schema.type = ['string', 'object']
        addFormat(schema, 'date-time')
      } else {
        // A reference to another model as nested JSON data, use $ref instead
        // of type, but append '_required' to use the version of the schema
        // that has the 'required' keyword defined.
        delete schema.type
        schema.$ref = type
      }
    } else {
      // Root properties schema or nested objects
      const properties = schema
      const required = []
      for (const [key, property] of Object.entries(schema)) {
        if (property.required) {
          required.push(key)
        }
        properties[key] = isObject(property)
          ? convertSchema(property, {})
          : property
      }
      schema = {
        type: 'object',
        properties,
        ...(required.length > 0 && { required })
      }
    }
    if (!isRoot) {
      // Our 'required' is not the same as JSON Schema's: Use the 'required'
      // format instead that only validates if required string is not empty.
      const { required, default: _default, ...rest } = schema
      schema = required ? addFormat(rest, 'required')
        // If not required, allow null type:
        : !isItems ? addNull(rest)
        : rest
      if (_default && !excludeDefaults[_default]) {
        schema.default = _default
      }
    }
  } else if (isArray(schema)) {
    schema = schema.map(entry => convertSchema(entry))
  } else if (isItems && isString(schema)) {
    schema = {
      // Expand `{ items: type }` to `{ items: { type } }`, and if type is a
      // $ref, then further to `{ items: { $ref: type } }`:
      items: convertSchema({ type: schema }, { isItems: true })
    }
  }
  if (isRoot) {
    console.log(util.inspect(schema, { depth: 10 }))
  }
  return schema
}

function addFormat(schema, format) {
  // Support multiple `format` keywords through `allOf`:
  const { allOf } = schema
  if (schema.format || allOf) {
    (allOf || (schema.allOf = [])).push({ format })
  } else {
    schema.format = format
  }
  return schema
}

function addNull(schema) {
  // Add 'null' to the allowed types through `anyOf`.
  // Move format along with type, and also support $ref:
  const { type, $ref, format, ...rest } = schema
  return {
    anyOf: [
      $ref ? { $ref } : format ? { type, format } : { type },
      { type: 'null' }
    ],
    ...rest
  }
}

// JSON types, used to determine when to use `$ref` instead of `type`.
const jsonTypes = {
  string: true,
  number: true,
  integer: true,
  boolean: true,
  object: true,
  array: true
}

const excludeDefaults = {
  'now()': true
}

const relationLookup = {
  // oneToOne:
  belongsToOne: BelongsToOneRelation,
  hasOne: HasOneRelation,
  hasOneThrough: HasOneThroughRelation,
  // toMany:
  hasMany: HasManyRelation,
  manyToMany: ManyToManyRelation
}

const relationClasses = {
  BelongsToOneRelation,
  HasOneRelation,
  HasOneThroughRelation,
  HasManyRelation,
  ManyToManyRelation
}

export function convertRelations(ownerModelClass, schema, models) {
  function convertReference(reference) {
    const [modelName, propertyName] = reference && reference.split('.') || []
    const modelClass = models[modelName]
    if (modelClass) {
      const columnName = modelClass.propertyNameToColumnName(propertyName)
      return `${modelClass.tableName}.${columnName}`
    }
    return reference
  }

  const relations = {}
  for (const [name, relationSchema] of Object.entries(schema)) {
    let {
      relation,
      modelClass,
      join: {
        from,
        through,
        to
      } = {},
      ...rest
    } = relationSchema || {}
    const relationClass = relationLookup[relation] ||
      relationClasses[relation] || relation
    if (relationClass && relationClass.prototype instanceof Relation) {
      from = asArray(from).map(convertReference)
      to = asArray(to).map(convertReference)
      relations[name] = {
        relation: relationClass,
        modelClass: models[modelClass] || modelClass,
        join: { from, through, to },
        ...rest
      }
    } else {
      throw new Error(
        `${ownerModelClass.name}.relations.${name}: ` +
        `Unrecognized relation: ${relation}`)
    }
  }
  return relations
}
