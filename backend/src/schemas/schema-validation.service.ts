import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/sqlite'
import Ajv, { ErrorObject } from 'ajv'
import { Schema } from '@src/database/entities/schema.entity'
import { get } from 'http'
// import { Schema } from '../database/entities/schema.entity'

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
    this.getSchema('email')
  }

  test() {
    const validate = this.ajv.compile(emailSchema)
    const data = JSON.parse(productData)
    const valid = validate(data)
    if (!valid) {
      console.log('Validation errors:', validate.errors)
    } else {
      console.log('Validation succeeded')
    }
  }

  async getSchema(code: string) {
    const em = this.em.fork() //TODO: nog te verwijderen !
    const all: Schema[] = await em.findAll('Schema')
    const fundamental = all.filter(s => s.fundamental).find(s => s.code === code)
    if (!fundamental) {
      throw new NotFoundException(`Schema with code '${code}' not found`)
    }
  }
}

interface Email {
  subject: string
  content: string
  customer: {
    id: number
    name: string
    emailAddress: string
  }
}

const emailSchema = {
  $id: 'my-product-schema',
  type: 'object',
  properties: {
    subject: {
      type: 'string',
      description: 'Subject of the email',
    },
    content: {
      type: 'string',
      description: 'Content of the email',
    },
    customer: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'The unique identifier for the customer',
        },
        name: {
          type: 'string',
          description: 'Name of the customer',
        },
        emailAddress: {
          type: 'string',
          description: 'Email address of the customer',
        },
      },
      required: ['id', 'name', 'emailAddress'],
      description: 'Customer receiving the email',
    },
  },
}

const productData = `{
  "subject": "Your reservation",
  "content": "Your reservation is confirmed.",
  "customer": {
    "id": 321,
    "name": "Stefaan Vandevelde",
    "emailAddress": "stefaan.vandevelde@example.com"
  }
}`
