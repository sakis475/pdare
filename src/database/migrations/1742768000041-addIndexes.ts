import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1742768000041 implements MigrationInterface {
    name = 'AddIndexes1742768000041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_e11b13ec63270b4a842a9f3abc" ON "category" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4e6dd2ec2594fa34d8a57a6c62" ON "inventory" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_65b1b155df8d445c401c0d0427" ON "user" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_83b788250cced69e674f10adb8" ON "invitation_request" ("inviteFromId") `);
        await queryRunner.query(`CREATE INDEX "IDX_3e2afcc684c246005fa490e274" ON "invitation_request" ("inviteToId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9bc82e696f797a556e9fe355c3" ON "invitation_request" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_db347c1090b7ade933a46c74ed" ON "item_property" ("itemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5743a5836d0f99b4e106e9e51" ON "item_property" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0c8f47a702c974a77812169bc" ON "item" ("categoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ba67381e8e1e0801134f8a5c7b" ON "item" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_438a5d106a429110450ee60a9a" ON "item_properties_pattern" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a3b0bc1741857d7aabc772373c" ON "item_properties_pattern" ("categoryId") `);
        await queryRunner.query(`CREATE INDEX "IDX_4261a48545dcc289c6050be41c" ON "order_order_item_item_property_item" ("orderItemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_10260a1c82733f9aeb44842920" ON "order_order_item_item_property_item" ("itemPropertyId") `);
        await queryRunner.query(`CREATE INDEX "IDX_646bf9ece6f45dbe41c203e06e" ON "order_item" ("orderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e03f3ed4dab80a3bf3eca50bab" ON "order_item" ("itemId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfbf9c025448272dc0453bf8f5" ON "table" ("restaurantId") `);
        await queryRunner.query(`CREATE INDEX "IDX_7a2dee791fe7a1da14e909577e" ON "table" ("occupiedByOrderId") `);
        await queryRunner.query(`CREATE INDEX "IDX_caabe91507b3379c7ba73637b8" ON "order" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a9757413db9333d4bb21a2a42a" ON "order" ("tableId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f5d6203d2a8ad7396119c9b61" ON "printer" ("restaurantId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1f5d6203d2a8ad7396119c9b61"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9757413db9333d4bb21a2a42a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_caabe91507b3379c7ba73637b8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7a2dee791fe7a1da14e909577e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfbf9c025448272dc0453bf8f5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e03f3ed4dab80a3bf3eca50bab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_646bf9ece6f45dbe41c203e06e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_10260a1c82733f9aeb44842920"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4261a48545dcc289c6050be41c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3b0bc1741857d7aabc772373c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_438a5d106a429110450ee60a9a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ba67381e8e1e0801134f8a5c7b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0c8f47a702c974a77812169bc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5743a5836d0f99b4e106e9e51"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_db347c1090b7ade933a46c74ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bc82e696f797a556e9fe355c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3e2afcc684c246005fa490e274"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_83b788250cced69e674f10adb8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_65b1b155df8d445c401c0d0427"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e6dd2ec2594fa34d8a57a6c62"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e11b13ec63270b4a842a9f3abc"`);
    }

}
