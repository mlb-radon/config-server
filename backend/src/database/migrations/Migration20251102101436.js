'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20251102101436 extends Migration {
  async up() {
    this.addSql(`
      create table \`schema\` (
        \`id\` integer not null primary key autoincrement, 
        \`created_at\` datetime not null default CURRENT_TIMESTAMP, 
        \`updated_at\` datetime null, 
        \`program_versions\` text null default null,
        \`fundamental\` integer not null default false, 
        \`code\` text null, 
        \`description\` text null,
        \`json_schema\` json not null
      );`)
  }
}
exports.Migration20251102101436 = Migration20251102101436

