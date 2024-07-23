import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemDescription1720988595659 implements MigrationInterface {
    name = 'ItemDescription1720988595659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "item" DROP COLUMN "description"`);
    }

}
