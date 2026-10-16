-- Add gender to User
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
ALTER TABLE "User" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'MALE';
