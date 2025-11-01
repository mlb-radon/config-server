'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const { Migration } = require('@mikro-orm/migrations')

class Migration20251101224159 extends Migration {
  async up() {
    this.addSql(
      `create table \`definition\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null default CURRENT_TIMESTAMP, \`updated_at\` datetime null, \`code\` text null, \`description\` text null, \`schema\` text not null);`,
    )

    this.addSql(
      `create table \`definition_parents\` (\`definition_1_id\` integer not null, \`definition_2_id\` integer not null, constraint \`definition_parents_definition_1_id_foreign\` foreign key(\`definition_1_id\`) references \`definition\`(\`id\`) on delete cascade on update cascade, constraint \`definition_parents_definition_2_id_foreign\` foreign key(\`definition_2_id\`) references \`definition\`(\`id\`) on delete cascade on update cascade, primary key (\`definition_1_id\`, \`definition_2_id\`));`,
    )
    this.addSql(
      `create index \`definition_parents_definition_1_id_index\` on \`definition_parents\` (\`definition_1_id\`);`,
    )
    this.addSql(
      `create index \`definition_parents_definition_2_id_index\` on \`definition_parents\` (\`definition_2_id\`);`,
    )

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
exports.Migration20251101224159 = Migration20251101224159

