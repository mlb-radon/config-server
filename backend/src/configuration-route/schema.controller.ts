import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from './config.service'

//TODO: Error() naar InternalServerErrorException() omzetten
@Controller()
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  /**
   * GET /config/:code/:version
   * Retrieves a schema with all references resolved for a specific version
   */
  @Get('config/:code/:version')
  async getConfigWithVersion(@Param('code') code: string, @Param('version') version: string) {
    try {
      return await this.configService.getConfig(code, version)
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * GET /config/:code
   * Retrieves a schema with all references resolved (latest version)
   */
  @Get('config/:code')
  async getConfig(@Param('code') code: string) {
    try {
      return await this.configService.getConfig(code)
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  // /**
  //  * POST /schema/validate
  //  * Validates data against a schema
  //  * Body: { schemaCode: string, data: any }
  //  */
  // @Post('validate')
  // async validateData(@Body() body: { schemaCode: string; data: any }) {
  //   try {
  //     const result = await this.configService.validate(body.schemaCode, body.data)
  //     return { success: true, ...result }
  //   } catch (error: any) {
  //     throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
  //   }
  // }

  // /**
  //  * POST /schema/upsert
  //  * Creates or updates a schema
  //  * Body: { code: string, description?: string, fundamental?: boolean, jsonSchema: object | string }
  //  */
  // @Post('upsert')
  // async upsertSchema(
  //   @Body()
  //   body: {
  //     code: string
  //     description?: string
  //     fundamental?: boolean
  //     jsonSchema: object | string
  //   },
  // ) {
  //   try {
  //     const schema = await this.configService.upsertSchema(body)
  //     return { success: true, schema }
  //   } catch (error: any) {
  //     throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
  //   }
  // }
}
