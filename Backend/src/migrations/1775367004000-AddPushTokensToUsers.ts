import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPushTokensToUsers1775367004000 implements MigrationInterface {
    name = 'AddPushTokensToUsers1775367004000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "pushTokens" jsonb NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pushTokens"`);
    }
}
