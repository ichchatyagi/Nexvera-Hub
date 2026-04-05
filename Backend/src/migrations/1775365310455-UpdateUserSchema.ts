import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSchema1775365310455 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Core fields missing on server
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetOtp" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetOtpExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationOtp" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationOtpExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" character varying(20) DEFAULT 'pending'`);
        
        // Profile fields
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "language" character varying(10) DEFAULT 'en'`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" text`);
        
        // Teacher Specific
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "headline" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "expertise" text`); // simple-array
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "qualifications" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "yearsExperience" integer DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hourlyRate" numeric(10,2) DEFAULT 0`);
        
        // Student Specific
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "educationLevel" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" text`); // simple-array
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "learningGoals" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "learningGoals"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "interests"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "educationLevel"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "hourlyRate"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "yearsExperience"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "qualifications"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "expertise"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "headline"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatarUrl"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "language"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "timezone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "country"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "bio"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "firstName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "status"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "verificationOtpExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "verificationOtp"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "resetOtpExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "resetOtp"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "name"`);
    }

}
