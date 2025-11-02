'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20251102200000 extends Migration {
  async up() {
    this.addSql(`create table \`config-data\` (
      \`id\` integer not null primary key autoincrement,
      \`created_at\` datetime not null default CURRENT_TIMESTAMP,
      \`updated_at\` datetime null,
      \`code\` text null,
      \`schema\` text not null,
      \`environment\` text check (\`environment\` in ('development', 'test', 'staging', 'production')) not null,
      \`program_versions\` text not null default '',
      \`description\` text null,
      \`value\` json not null
    );`)
  }

  async down() {
    this.addSql(`drop table if exists \`config-data\`;`)
  }
}
exports.Migration20251102200000 = Migration20251102200000
