import { MigrationInterface, QueryRunner } from "typeorm";

export class First1720636310644 implements MigrationInterface {
    name = 'First1720636310644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "restaurant" ("id" SERIAL NOT NULL, "restaurantName" text NOT NULL, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_53228f26190152827cf5e2763aa" UNIQUE ("restaurantName"), CONSTRAINT "PK_649e250d8b8165cb406d99aa30f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "title" text NOT NULL, "orderCategory" integer, "restaurantId" integer NOT NULL, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_806c18953a98ed033ea019edf3" ON "category" ("title", "restaurantId") `);
        await queryRunner.query(`CREATE TABLE "item" ("id" SERIAL NOT NULL, "title" text NOT NULL, "cost" double precision NOT NULL, "orderItem" integer, "isEnabled" boolean NOT NULL DEFAULT true, "categoryId" integer, "restaurantId" integer, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."item_property_propertytype_enum" AS ENUM('singleselect', 'multiselect')`);
        await queryRunner.query(`CREATE TABLE "item_property" ("id" SERIAL NOT NULL, "propertyName" text NOT NULL, "propertyValue" text NOT NULL, "propertyType" "public"."item_property_propertytype_enum", "isEnabled" boolean NOT NULL DEFAULT true, "orderGroup" integer, "orderItem" integer, "itemId" integer, "restaurantId" integer, CONSTRAINT "PK_841b5df43ca62022dcf231ee08e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a0afea2d277fe9dbcaf245f1f8" ON "item_property" ("propertyName", "propertyValue", "itemId") `);
        await queryRunner.query(`CREATE TABLE "order_order_item_item_property_item" ("id" SERIAL NOT NULL, "orderItemId" integer, "itemPropertyId" integer, CONSTRAINT "PK_d1864202861b84153f6fb50f1d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" SERIAL NOT NULL, "quantity" integer NOT NULL, "comment" character varying NOT NULL DEFAULT '', "orderId" integer, "itemId" integer, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('owner', 'admin', 'adminOperator', 'waiter')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" text NOT NULL, "email" text NOT NULL, "firstName" text NOT NULL, "lastName" text NOT NULL, "role" "public"."user_role_enum" NOT NULL, "passwordHashed" text NOT NULL, "token" text, "active" boolean NOT NULL DEFAULT true, "restaurantId" integer, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "table" ("id" SERIAL NOT NULL, "tableName" character varying NOT NULL, "isEnabled" boolean NOT NULL DEFAULT true, "tableOrder" integer, "occupiedByOrderId" integer, "restaurantId" integer, CONSTRAINT "REL_7a2dee791fe7a1da14e909577e" UNIQUE ("occupiedByOrderId"), CONSTRAINT "PK_28914b55c485fc2d7a101b1b2a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "closedAt" date, "comment" character varying NOT NULL DEFAULT '', "userId" integer, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_e11b13ec63270b4a842a9f3abc0" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_c0c8f47a702c974a77812169bc2" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_ba67381e8e1e0801134f8a5c7b0" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_property" ADD CONSTRAINT "FK_db347c1090b7ade933a46c74ed6" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item_property" ADD CONSTRAINT "FK_b5743a5836d0f99b4e106e9e516" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_order_item_item_property_item" ADD CONSTRAINT "FK_4261a48545dcc289c6050be41cf" FOREIGN KEY ("orderItemId") REFERENCES "order_item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_order_item_item_property_item" ADD CONSTRAINT "FK_10260a1c82733f9aeb448429203" FOREIGN KEY ("itemPropertyId") REFERENCES "item_property"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_e03f3ed4dab80a3bf3eca50babc" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_65b1b155df8d445c401c0d04278" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "table" ADD CONSTRAINT "FK_7a2dee791fe7a1da14e909577eb" FOREIGN KEY ("occupiedByOrderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "table" ADD CONSTRAINT "FK_bfbf9c025448272dc0453bf8f55" FOREIGN KEY ("restaurantId") REFERENCES "restaurant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "table" DROP CONSTRAINT "FK_bfbf9c025448272dc0453bf8f55"`);
        await queryRunner.query(`ALTER TABLE "table" DROP CONSTRAINT "FK_7a2dee791fe7a1da14e909577eb"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_65b1b155df8d445c401c0d04278"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_e03f3ed4dab80a3bf3eca50babc"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`);
        await queryRunner.query(`ALTER TABLE "order_order_item_item_property_item" DROP CONSTRAINT "FK_10260a1c82733f9aeb448429203"`);
        await queryRunner.query(`ALTER TABLE "order_order_item_item_property_item" DROP CONSTRAINT "FK_4261a48545dcc289c6050be41cf"`);
        await queryRunner.query(`ALTER TABLE "item_property" DROP CONSTRAINT "FK_b5743a5836d0f99b4e106e9e516"`);
        await queryRunner.query(`ALTER TABLE "item_property" DROP CONSTRAINT "FK_db347c1090b7ade933a46c74ed6"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_ba67381e8e1e0801134f8a5c7b0"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_c0c8f47a702c974a77812169bc2"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_e11b13ec63270b4a842a9f3abc0"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "table"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "order_order_item_item_property_item"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a0afea2d277fe9dbcaf245f1f8"`);
        await queryRunner.query(`DROP TABLE "item_property"`);
        await queryRunner.query(`DROP TYPE "public"."item_property_propertytype_enum"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_806c18953a98ed033ea019edf3"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "restaurant"`);
    }

}
