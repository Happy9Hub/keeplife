-- AlterTable
ALTER TABLE `users` ADD COLUMN `activeHouseholdId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `users_activeHouseholdId_idx` ON `users`(`activeHouseholdId`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_activeHouseholdId_fkey` FOREIGN KEY (`activeHouseholdId`) REFERENCES `households`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
