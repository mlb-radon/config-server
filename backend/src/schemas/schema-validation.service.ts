import { Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/sqlite'
import Ajv from 'ajv'
import { Schema, SchemaSchema } from '@src/database/entities/schema.entity'
import { ConfigDataSchema } from '@src/database/entities/config-data.entity'
import { isString } from 'radashi'

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
    console.log(await this.getData('email', '0.0.1'))
  }

  async getSchema(code: string) {
    const em = this.em.fork() //TODO: nog te verwijderen bij gebruik in controller !!!!
    const ajv = new Ajv({ allErrors: true, verbose: true })
    const all: Schema[] = await em.findAll(SchemaSchema)
    const fundamental = all.filter(s => s.fundamental).find(s => s.code === code)?.jsonSchema
    if (!fundamental) {
      throw new NotFoundException(`Schema with code '${code}' not found`)
    }
    const schemas = all.map(s => s.jsonSchema)
    schemas.forEach(s => ajv.addSchema(typeof s === 'string' ? JSON.parse(s) : s))
    const fSchema = typeof fundamental === 'string' ? JSON.parse(fundamental) : fundamental
    return ajv.compile<Email>(fSchema)
  }

  async getData(code: string, version: string) {
    const em = this.em.fork() //TODO: nog te verwijderen bij gebruik in controller !!!!
    const visited = new Set<string>([code])
    const regex = /\$ref:\s*(\w+)/g
    const record = await em.findOne(ConfigDataSchema, { code, programVersions: version }) //TODO!: version handling
    if (!record)
      throw new NotFoundException(
        `Config data with code '${code}' and version '${version}' not found`,
      )
    let data = JSON.stringify(record.value)

    // Extract all $ref matches
    let matches = [...data.matchAll(regex)]
    while (matches.length > 0) {
      //TODO: check if all data conforms to schema
      const refCodes = matches.map(match => match[1])
      const records = await em.find(ConfigDataSchema, {
        //TODO: version handling
        code: { $in: refCodes },
        programVersions: version,
      })
      const refMap = new Map<string, string>()
      records.forEach(r => {
        refMap.set(r.code!, r.value)
      })
      for (const refCode of refCodes) {
        if (visited.has(refCode))
          throw new Error(`Circular reference detected for code '${refCode}'`)
        const toReplace = isString(refMap.get(refCode))
          ? `\\$ref:\\s*${refCode}`
          : `"\\$ref:\\s*${refCode}"`
        data = data.replaceAll(new RegExp(toReplace, 'g'), JSON.stringify(refMap.get(refCode)))
      }
      matches = [...data.matchAll(regex)]
    }
    return JSON.parse(data)
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
  subject: 'Your reservation',
  content: 'Your reservation is confirmed.',
  customer: {
    id: 321,
    name: 'Stefaan Vandevelde',
    emailAddress: 'stefaan.vandevelde@example.com',
  },
}

const emailJson = `{
  "subject": "Your reservation",
  "content": "Your reservation is confirmed.",
  "customer": "$ref:stefaan"
}`
