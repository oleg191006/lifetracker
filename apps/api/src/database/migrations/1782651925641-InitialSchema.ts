import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1782651925641 implements MigrationInterface {
    name = 'InitialSchema1782651925641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daily_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "date" date NOT NULL, "plan_pct" smallint NOT NULL, "focus" smallint NOT NULL, "energy" smallint NOT NULL, "score" numeric(4,2), "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cd4961aae71dfeaab8130b0b2db" UNIQUE ("user_id", "date"), CONSTRAINT "PK_ea32d6160ba0b85cb14426c50b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "energy_checks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "checked_at" TIMESTAMP NOT NULL DEFAULT NOW(), "level" smallint NOT NULL, "note" text, CONSTRAINT "PK_a7c107af94f81909d3e263d66d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "course_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "course_id" uuid NOT NULL, "date" date NOT NULL, "lessons_from" integer NOT NULL, "lessons_to" integer NOT NULL, "duration_min" integer, "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eadd1b31d44023e533eb847c4f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "learning_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "course_id" uuid NOT NULL, "date" date NOT NULL DEFAULT ('now'::text)::date, "insight" text NOT NULL, "confusion" text, "duration_min" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_859ce04e681ecea5104e5584353" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "total_lessons" integer NOT NULL, "deadline" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sleep_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "date" date NOT NULL, "bed_time" TIMESTAMP NOT NULL, "wake_time" TIMESTAMP NOT NULL, "duration_min" integer, "quality" smallint NOT NULL, "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7710714630369daaab54791b7a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "daily_logs" ADD CONSTRAINT "FK_28dc684c15a9369be262170f705" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "energy_checks" ADD CONSTRAINT "FK_b856a3616386be0e92e9662d2cd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_progress" ADD CONSTRAINT "FK_468b14b39d8428b77d8630bd5cc" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "learning_logs" ADD CONSTRAINT "FK_7f905df13bf2f9f2a38f2dccc84" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "learning_logs" ADD CONSTRAINT "FK_928c96d98f773f9448f0d48e3a1" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_a4396a5235f159ab156a6f8b603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sleep_logs" ADD CONSTRAINT "FK_28c64c268a3b78937fb16896ded" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sleep_logs" DROP CONSTRAINT "FK_28c64c268a3b78937fb16896ded"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_a4396a5235f159ab156a6f8b603"`);
        await queryRunner.query(`ALTER TABLE "learning_logs" DROP CONSTRAINT "FK_928c96d98f773f9448f0d48e3a1"`);
        await queryRunner.query(`ALTER TABLE "learning_logs" DROP CONSTRAINT "FK_7f905df13bf2f9f2a38f2dccc84"`);
        await queryRunner.query(`ALTER TABLE "course_progress" DROP CONSTRAINT "FK_468b14b39d8428b77d8630bd5cc"`);
        await queryRunner.query(`ALTER TABLE "energy_checks" DROP CONSTRAINT "FK_b856a3616386be0e92e9662d2cd"`);
        await queryRunner.query(`ALTER TABLE "daily_logs" DROP CONSTRAINT "FK_28dc684c15a9369be262170f705"`);
        await queryRunner.query(`DROP TABLE "sleep_logs"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "learning_logs"`);
        await queryRunner.query(`DROP TABLE "course_progress"`);
        await queryRunner.query(`DROP TABLE "energy_checks"`);
        await queryRunner.query(`DROP TABLE "daily_logs"`);
    }

}
