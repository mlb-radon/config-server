import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common'
import { ConfigService } from './config.service'

//TODO: Error() naar InternalServerErrorException() omzetten
@Controller()
export class ConfigController {
  constructor(private readonly schemaValidationService: ConfigService) {}

  @Get('config/:code')
  async getConfig(@Param('code') code: string) {
    return await this.schemaValidationService.getConfig(code)
  }

  @Get('config/:code/:version')
  async getConfig2(@Param('code') code: string, @Param('version') version: string) {
    return await this.schemaValidationService.getConfig(code, version)
  }
}
