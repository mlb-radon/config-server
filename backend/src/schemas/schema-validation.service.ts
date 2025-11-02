import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/sqlite'
import Ajv, { ErrorObject } from 'ajv'
import { Schema } from '@src/database/entities/schema.entity'

interface ValidationResult {
  valid: boolean
  errors?: ErrorObject[]
}

@Injectable()
export class SchemaValidationService {
  constructor(private readonly em: EntityManager) {
    void this.test()
  }

  async test() {
    const validate = await this.getSchema('email')
    const valid = validate(emailData)
    console.log('Validation result:', valid)
    if (!valid) {
      console.log('Validation errors:', JSON.stringify(validate.errors, null, 2))
    }
  }

  async getSchema(code: string) {
    const ajv = new Ajv({
      allErrors: true,
      verbose: true,
    })
    const em = this.em.fork() //TODO: nog te verwijderen bij gebruik in controller !!!!
    const all: Schema[] = await em.findAll('Schema')
    const fundamental = all.filter(s => s.fundamental).find(s => s.code === code)?.jsonSchema
    if (!fundamental) {
      throw new NotFoundException(`Schema with code '${code}' not found`)
    }
    const schemas = all.map(s => s.jsonSchema)
    schemas.forEach(s => ajv.addSchema(typeof s === 'string' ? JSON.parse(s) : s))
    const fSchema = typeof fundamental === 'string' ? JSON.parse(fundamental) : fundamental
    return ajv.compile<Email>(fSchema)
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

const emailData = {
  subjectx: 'Your reservation',
  content: 'Your reservation is confirmed.',
  customer: {
    id: 321,
    name: 'Stefaan Vandevelde',
    emailAddress: 'stefaan.vandevelde@example.com',
  },
}
