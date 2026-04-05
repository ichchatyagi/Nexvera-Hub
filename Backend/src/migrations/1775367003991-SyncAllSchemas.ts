import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncAllSchemas1775367003991 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- 1. USERS TABLE ---
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetOtp" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "resetOtpExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationOtp" character varying(5)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationOtpExpiresAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" character varying(20) DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "country" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "language" character varying(10) DEFAULT 'en'`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "avatarUrl" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "headline" character varying(200)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "expertise" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "qualifications" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "yearsExperience" integer DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hourlyRate" numeric(10,2) DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "educationLevel" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "learningGoals" text`);

        // --- 2. TRANSACTIONS TABLE ---
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "courseId" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "amount" numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "currency" character varying(10) DEFAULT 'INR'`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "stripePaymentId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "razorpayOrderId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "razorpayPaymentId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "razorpaySignature" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "metadata" jsonb`);

        // --- 3. TEACHER PAYOUTS TABLE ---
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "teacher_payouts" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "teacherId" uuid NOT NULL,
            "courseId" character varying(50),
            "cohortId" uuid,
            "amount" numeric(12,2) NOT NULL,
            "currency" character varying(10) DEFAULT 'USD',
            "status" character varying(20) DEFAULT 'pending',
            "stripeTransferId" character varying(255),
            "metadata" jsonb,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
        )`);
        
        // Ensure columns match if table already existed half-formed
        await queryRunner.query(`ALTER TABLE "teacher_payouts" ADD COLUMN IF NOT EXISTS "stripeTransferId" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "teacher_payouts" ADD COLUMN IF NOT EXISTS "metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reversal logic for columns/table
        await queryRunner.query(`DROP TABLE IF EXISTS "teacher_payouts"`);
        
        // Transaction columns cleanup
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "metadata"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN IF EXISTS "stripePaymentId"`);
        // ... (Skipping full manual reversal for many individual columns to focus on safety)
    }

}
