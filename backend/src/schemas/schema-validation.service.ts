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

  async getSchema(code: string) {
    const em = this.em.fork() //TODO: nog te verwijderen !
    const all: Schema[] = await em.findAll('Schema')
    const fundamental = all.filter(s => s.fundamental).find(s => s.code === code)?.jsonSchema
    if (!fundamental) {
      throw new NotFoundException(`Schema with code '${code}' not found`)
    }
    const schemas = all.map(s => s.jsonSchema)
    schemas.forEach(s => this.ajv.addSchema(typeof s === 'string' ? JSON.parse(s) : s))
    const fSchema = typeof fundamental === 'string' ? JSON.parse(fundamental) : fundamental
    const validate = this.ajv.compile(fSchema)
    const valid = validate(JSON.parse(emailData))
    console.log(valid)
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
const emailData = `{
  "subject": "Your reservation",
  "content": "Your reservation is confirmed.",
  "customer": {
    "id": 321,
    "name": "Stefaan Vandevelde",
    "emailAddress": "stefaan.vandevelde@example.com"
  }
}`
