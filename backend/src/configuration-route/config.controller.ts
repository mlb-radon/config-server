import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from './config.service'

//TODO: Error() naar InternalServerErrorException() omzetten
@Controller()
export class ConfigController {
  constructor(private readonly schemaValidationService: ConfigService) {}

  @Get('config/:code')
  async getConfig(@Param('code') code: string) {
    try {
      return await this.schemaValidationService.getConfig(code)
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  @Get('config/:code/:version')
  async getConfig2(@Param('code') code: string, @Param('version') version: string) {
    try {
      return await this.schemaValidationService.getConfig(code, version)
    } catch (error: any) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
