-- AlterTable
ALTER TABLE "EmployerProfile" ADD COLUMN     "companyLogo" TEXT;

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_companyLogo_fkey" FOREIGN KEY ("companyLogo") REFERENCES "FileObject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
