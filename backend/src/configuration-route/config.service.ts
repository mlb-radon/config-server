import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from '@mikro-orm/sqlite'
import Ajv from 'ajv'
import { Schema, SchemaSchema } from '@src/database/entities/schema.entity'
import { ConfigDataSchema } from '@src/database/entities/config-data.entity'
import { first, isString, isUndefined } from 'radashi'
import { satisfies } from 'semver'

@Injectable()
export class ConfigService {
  constructor(private readonly em: EntityManager) {}

  async getSchema(code: string, version: string = '*') {
    const em = this.em.fork() //TODO: nog te verwijderen bij gebruik in controller !!!!
    const ajv = new Ajv({ allErrors: true, verbose: true })
    const all: Schema[] = await em.findAll(SchemaSchema)
    const fundamental = all
      .filter(s => s.fundamental)
      .find(s => s.code === code && satisfies(version, s.programVersions))?.jsonSchema
    if (!fundamental) {
      const msg = `Schema with code '${code}' (version ${version}) not found`
      throw new NotFoundException(msg)
    }
    const schemas = all.map(s => s.jsonSchema)
    schemas.forEach(s => ajv.addSchema(typeof s === 'string' ? JSON.parse(s) : s))
    const fSchema = typeof fundamental === 'string' ? JSON.parse(fundamental) : fundamental
    return ajv.compile<Email>(fSchema)
  }

  async getConfig(code: string, version?: string) {
    const em = this.em.fork() //TODO: nog te verwijderen bij gebruik in controller !!!!
    const records = await em.find(ConfigDataSchema, { code })
    const filtered = version ? records.filter(r => satisfies(version, r.programVersions)) : records
    if (filtered.length === 0) {
      const msg = `Config data '${code}' with version '${version}' not found`
      throw new NotFoundException(msg)
    }
    if (filtered.length > 1) {
      const versions = filtered.map(r => r.programVersions).join(', ')
      const versionInfo = isUndefined(version) ? '' : ` for version '${version}'`
      const msg = `Multiple configuration '${code}' versions ${versionInfo}: ${versions}`
      throw new ConflictException(msg)
    }
    let data = JSON.stringify(first(filtered)!.value)

    // Extract all $ref matches
    const regex = /\$ref:\s*(\w+)/g
    const visited = new Set<string>([code])
    let matches = [...data.matchAll(regex)]
    while (matches.length > 0) {
      //TODO: check if all data conforms to schema
      const refCodes = matches.map(match => match[1])
      const records = await em.find(ConfigDataSchema, {
        code: { $in: refCodes },
      })
      const refMap = new Map<string, string>()
      records.forEach(r => {
        refMap.set(r.code!, r.value)
      })
      for (const refCode of refCodes) {
        if (visited.has(refCode))
          throw new Error(`Circular reference detected for code '${refCode}'`)
        if (!refMap.has(refCode)) throw new Error(`Missing reference '${refCode}'`)
        const toReplace = isString(refMap.get(refCode))
          ? `\\$ref:\\s*${refCode}`
          : `"\\$ref:\\s*${refCode}"`
        data = data.replaceAll(new RegExp(toReplace, 'g'), JSON.stringify(refMap.get(refCode)))
      }
      matches = [...data.matchAll(regex)]
    }
    const schemaValidator = await this.getSchema(code, version || '*')
    const dataObj = JSON.parse(data)
    const valid = schemaValidator(dataObj)
    if (!valid) {
      const msg = `Config data for '${code}' (${version}) does not ` + `conform with the schema`
      throw new ConflictException({
        message: msg,
        errors: schemaValidator.errors,
      })
    }
    return data
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
