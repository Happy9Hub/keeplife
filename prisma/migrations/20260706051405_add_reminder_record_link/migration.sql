-- AlterTable
ALTER TABLE `reminders` ADD COLUMN `recordId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `reminders_recordId_idx` ON `reminders`(`recordId`);

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_recordId_fkey` FOREIGN KEY (`recordId`) REFERENCES `records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
