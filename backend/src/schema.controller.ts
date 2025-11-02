import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common'
import { SchemaValidationService } from './schema-validation.service'

@Controller('schema')
export class SchemaController {
  constructor(private readonly schemaValidationService: SchemaValidationService) {}

  /**
   * GET /schema/:code
   * Retrieves a schema with all references resolved
   */
  @Get(':code')
  async getSchema(@Param('code') code: string) {
    try {
      const schema = await this.schemaValidationService.getSchema(code)
      return { success: true, schema }
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * POST /schema/validate
   * Validates data against a schema
   * Body: { schemaCode: string, data: any }
   */
  @Post('validate')
  async validateData(@Body() body: { schemaCode: string; data: any }) {
    try {
      const result = await this.schemaValidationService.validate(body.schemaCode, body.data)
      return { success: true, ...result }
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * POST /schema/upsert
   * Creates or updates a schema
   * Body: { code: string, description?: string, fundamental?: boolean, jsonSchema: object | string }
   */
  @Post('upsert')
  async upsertSchema(
    @Body()
    body: {
      code: string
      description?: string
      fundamental?: boolean
      jsonSchema: object | string
    },
  ) {
    try {
      const schema = await this.schemaValidationService.upsertSchema(body)
      return { success: true, schema }
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
