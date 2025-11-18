import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/sqlite'
import Ajv, { ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'
import { Schema } from '@src/database/schemas/schema.schema'

interface ValidationResult {
  valid: boolean
  errors?: ErrorObject[]
}

@Injectable()
export class SchemaValidationService {
  private ajv = new Ajv({
    allErrors: true,
    verbose: true,
  })

  constructor(private readonly em: EntityManager) {
    // addFormats(this.ajv)
  }

  /**
   * Validates data against a schema identified by its code.
   * @param schemaCode - The code of the schema to validate against
   * @param data - The data to validate
   * @returns Validation result with success status and errors if any
   */
  async validate(schemaCode: string, data: any): Promise<ValidationResult> {
    const fullSchema = await this.getSchema(schemaCode)

    let validator: any
    try {
      validator = this.ajv.compile(fullSchema)
    } catch (error: any) {
      throw new BadRequestException(`Failed to compile schema '${schemaCode}': ${error.message}`)
    }

    const valid = validator(data) as boolean

    return {
      valid,
      errors: valid ? undefined : validator.errors || [],
    }
  }

  /**
   * Retrieves a full schema with all $ref references resolved.
   * @param schemaCode - The code of the schema to retrieve
   * @returns The complete schema with resolved references
   */
  async getSchema(schemaCode: string): Promise<any> {
    const schema = (await this.em.findOne('Schema', { code: schemaCode })) as Schema | null

    if (!schema) {
      throw new NotFoundException(`Schema with code '${schemaCode}' not found`)
    }

    const jsonSchema =
      typeof schema.jsonSchema === 'string' ? JSON.parse(schema.jsonSchema) : schema.jsonSchema

    return this.resolveRefs(jsonSchema)
  }

  /**
   * Recursively resolves all $ref references in a schema.
   * References are expected to be in the format "#/schemaCode"
   * @param schema - The schema object to resolve
   * @param visited - Set of already visited schema codes to prevent circular references
   * @returns The schema with all references resolved
   */
  private async resolveRefs(schema: any, visited: Set<string> = new Set()): Promise<any> {
    if (typeof schema !== 'object' || schema === null) {
      return schema
    }

    // Handle arrays
    if (Array.isArray(schema)) {
      return Promise.all(schema.map(item => this.resolveRefs(item, visited)))
    }

    // Handle $ref
    if (schema.$ref && typeof schema.$ref === 'string') {
      const refMatch = schema.$ref.match(/^#\/(.+)$/)
      if (refMatch) {
        const refCode = refMatch[1]

        // Check for circular references
        if (visited.has(refCode)) {
          throw new BadRequestException(`Circular reference detected: ${refCode}`)
        }

        const refSchema = (await this.em.findOne('Schema', { code: refCode })) as Schema | null
        if (!refSchema) {
          throw new NotFoundException(`Referenced schema '${refCode}' not found`)
        }

        const refJsonSchema =
          typeof refSchema.jsonSchema === 'string'
            ? JSON.parse(refSchema.jsonSchema)
            : refSchema.jsonSchema

        // Add to visited set and resolve nested refs
        const newVisited = new Set(visited)
        newVisited.add(refCode)

        return this.resolveRefs(refJsonSchema, newVisited)
      }
    }

    // Recursively process all object properties
    const resolved: any = {}
    for (const [key, value] of Object.entries(schema)) {
      if (key === '$ref') {
        // Already handled above, but keep it in case it's not in our format
        resolved[key] = value
      } else {
        resolved[key] = await this.resolveRefs(value, visited)
      }
    }

    return resolved
  }

  /**
   * Creates or updates a schema in the database.
   * Validates that all $ref references exist before upserting.
   * @param schemaData - The schema data to upsert
   * @returns The created or updated schema entity
   */
  async upsertSchema(schemaData: {
    code: string
    description?: string
    fundamental?: boolean
    jsonSchema: string | object
  }): Promise<Schema> {
    const jsonSchema =
      typeof schemaData.jsonSchema === 'string'
        ? JSON.parse(schemaData.jsonSchema)
        : schemaData.jsonSchema

    // Validate all $ref references exist
    await this.validateRefs(jsonSchema)

    // Find existing schema or create new one
    let schema = (await this.em.findOne('Schema', { code: schemaData.code })) as Schema | null

    if (schema) {
      // Update existing schema
      schema.description = schemaData.description ?? schema.description
      schema.fundamental = schemaData.fundamental ?? schema.fundamental
      schema.jsonSchema =
        typeof schemaData.jsonSchema === 'string'
          ? schemaData.jsonSchema
          : JSON.stringify(jsonSchema)
    } else {
      // Create new schema
      schema = this.em.create('Schema', {
        code: schemaData.code,
        description: schemaData.description,
        fundamental: schemaData.fundamental ?? false,
        jsonSchema:
          typeof schemaData.jsonSchema === 'string'
            ? schemaData.jsonSchema
            : JSON.stringify(jsonSchema),
      } as any) as Schema
    }

    await this.em.persistAndFlush(schema)
    return schema
  }

  /**
   * Validates that all $ref references in a schema exist in the database.
   * @param schema - The schema object to validate
   * @throws BadRequestException if any reference doesn't exist
   */
  private async validateRefs(schema: any, path: string = 'root'): Promise<void> {
    if (typeof schema !== 'object' || schema === null) {
      return
    }

    // Handle arrays
    if (Array.isArray(schema)) {
      for (let i = 0; i < schema.length; i++) {
        await this.validateRefs(schema[i], `${path}[${i}]`)
      }
      return
    }

    // Check $ref
    if (schema.$ref && typeof schema.$ref === 'string') {
      const refMatch = schema.$ref.match(/^#\/(.+)$/)
      if (refMatch) {
        const refCode = refMatch[1]
        const refExists = await this.em.findOne('Schema', { code: refCode })

        if (!refExists) {
          throw new BadRequestException(
            `Referenced schema '${refCode}' does not exist in database (at ${path}). ` +
              `Schemas must be created child-to-top (create referenced schemas first).`,
          )
        }
      }
    }

    // Recursively check all properties
    for (const [key, value] of Object.entries(schema)) {
      await this.validateRefs(value, `${path}.${key}`)
    }
  }
}
