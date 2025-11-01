'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20251101222242 extends Migration {
  async up() {
    // Create the table with updated_at as nullable with no default
    this.addSql(`
      create table \`definition\` (
      \`id\` integer not null primary key autoincrement, 
      \`created_at\` datetime not null default CURRENT_TIMESTAMP, 
      \`updated_at\` datetime null, 
      \`code\` text null, 
      \`description\` text null, 
      \`schema\` text not null);
    `)

    // Create trigger to automatically set updated_at only on UPDATE
    this.addSql(`
      CREATE TRIGGER definition_updated_at 
      AFTER UPDATE ON definition
      FOR EACH ROW
      WHEN OLD.code IS NOT NEW.code 
        OR OLD.description IS NOT NEW.description 
        OR OLD.schema IS NOT NEW.schema
      BEGIN
        UPDATE definition SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `)
  }
}
exports.Migration20251101222242 = Migration20251101222242

