import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsDeletedColumn1743855065837 implements MigrationInterface {
    name = 'AddIsDeletedColumn1743855065837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "isDeleted"`);
    }

}
