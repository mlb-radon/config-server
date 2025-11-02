# Schema Validation Service

A NestJS service for managing and validating JSON Schemas stored in a SQLite database with support for hierarchical schema references.

## Overview

The `SchemaValidationService` provides three main functions:

1. **validate** - Validates data against a stored schema
2. **getSchema** - Retrieves and resolves a schema with all references
3. **upsertSchema** - Creates or updates schemas (with validation that all references exist)

## Features

- **JSON Schema Draft 7 support** using Ajv validator
- **Reference resolution** - Automatically resolves `$ref` references in the format `#/schemaCode`
- **Forest structure** - Supports multiple independent schema trees
- **Child-to-parent validation** - Ensures referenced schemas exist before creating parent schemas
- **Circular reference detection** - Prevents infinite loops during resolution

## API Endpoints

### GET /schema/:code

Retrieves a schema with all `$ref` references resolved.

**Example:**

```bash
curl http://localhost:3000/schema/email
```

**Response:**

```json
{
  "success": true,
  "schema": {
    "$schema": "https://json-schema.org/draft-07/schema#",
    "type": "object",
    "properties": {
      "subject": { "type": "string" },
      "content": { "type": "string" },
      "customer": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "emailAddress": { "type": "string" }
        },
        "required": ["id", "name", "emailAddress"]
      }
    }
  }
}
```

### POST /schema/validate

Validates data against a schema.

**Body:**

```json
{
  "schemaCode": "email",
  "data": {
    "subject": "Hello",
    "content": "Test email",
    "customer": {
      "id": 123,
      "name": "John Doe",
      "emailAddress": "john@example.com"
    }
  }
}
```

**Response (success):**

```json
{
  "success": true,
  "valid": true
}
```

**Response (validation errors):**

```json
{
  "success": true,
  "valid": false,
  "errors": [
    {
      "instancePath": "/customer",
      "schemaPath": "#/properties/customer/required",
      "keyword": "required",
      "params": { "missingProperty": "emailAddress" },
      "message": "must have required property 'emailAddress'"
    }
  ]
}
```

### POST /schema/upsert

Creates or updates a schema. Validates that all `$ref` references exist.

**Body:**

```json
{
  "code": "person",
  "description": "Generic person schema",
  "fundamental": false,
  "jsonSchema": {
    "type": "object",
    "properties": {
      "id": { "type": "integer" },
      "name": { "type": "string" },
      "emailAddress": { "type": "string" }
    },
    "required": ["id", "name"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "schema": {
    "id": 1,
    "code": "person",
    "description": "Generic person schema",
    "fundamental": false,
    "jsonSchema": "{...}",
    "createdAt": "2025-11-02T10:15:54.000Z"
  }
}
```

**Error Response (missing reference):**

```json
{
  "statusCode": 400,
  "message": "Referenced schema 'person' does not exist in database (at root.$ref). Schemas must be created child-to-top (create referenced schemas first)."
}
```

## Usage in Code

### Injecting the Service

```typescript
import { Injectable } from '@nestjs/common'
import { SchemaValidationService } from './database/schema-validation.service'

@Injectable()
export class MyService {
  constructor(private readonly schemaValidation: SchemaValidationService) {}

  async validateEmail(emailData: any) {
    const result = await this.schemaValidation.validate('email', emailData)

    if (!result.valid) {
      console.error('Validation errors:', result.errors)
      throw new Error('Invalid email data')
    }

    return true
  }
}
```

### Creating Schemas Programmatically

Schemas must be created from leaf nodes to root (child-to-parent):

```typescript
// Step 1: Create base schema (no references)
await schemaValidation.upsertSchema({
  code: 'person',
  description: 'Base person schema',
  jsonSchema: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      emailAddress: { type: 'string' },
    },
    required: ['id', 'name'],
  },
})

// Step 2: Create parent schema (references person)
await schemaValidation.upsertSchema({
  code: 'email',
  fundamental: true,
  description: 'Email schema with customer reference',
  jsonSchema: {
    $schema: 'https://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: {
      subject: { type: 'string' },
      content: { type: 'string' },
      customer: {
        allOf: [{ $ref: '#/person' }, { required: ['emailAddress'] }],
      },
    },
  },
})
```

## Schema Reference Format

References use the format `#/schemaCode` where `schemaCode` is the `code` field of another schema entity.

**Example with references:**

```json
{
  "type": "object",
  "properties": {
    "owner": {
      "$ref": "#/person"
    }
  }
}
```

## Database Schema

The service works with the `Schema` entity:

```typescript
interface Schema {
  id: number
  code?: string // Unique identifier for the schema
  description?: string // Human-readable description
  fundamental: boolean // Flag for top-level schemas
  jsonSchema: string // JSON Schema definition (stored as JSON/string)
  createdAt: Date
  updatedAt?: Date
}
```

## Example Database Data

See `backend/src/database/example/example-schema.csv` for sample data showing:

- **person** - Base schema with no references
- **email** - References person with additional requirements
- **product** - References person for owner field

## Error Handling

The service throws:

- `NotFoundException` - When a schema or reference is not found
- `BadRequestException` - When schema compilation fails, circular references are detected, or references don't exist during upsert

## Implementation Notes

1. **Reference Resolution**: The `getSchema` method recursively resolves all `$ref` tags before returning the schema
2. **Circular Detection**: Tracks visited schemas to prevent infinite loops
3. **Validation Order**: `upsertSchema` validates all references exist before creating/updating
4. **Ajv Configuration**: Uses strict mode with all errors reported for comprehensive validation feedback
