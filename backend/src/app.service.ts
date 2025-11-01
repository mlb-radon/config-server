import { Injectable } from '@nestjs/common'
import { AppInfoService } from '@src/support/app-info.service'

@Injectable()
export class AppService {
  constructor(private readonly appInfoService: AppInfoService) {}
  getHello() {
    return this.appInfoService.getAppInfo()
  }
}
