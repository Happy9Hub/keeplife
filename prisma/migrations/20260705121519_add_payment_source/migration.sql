-- CreateTable
CREATE TABLE `payment_sources` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `householdId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `payment_sources_householdId_idx`(`householdId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `payment_sources` ADD CONSTRAINT `payment_sources_householdId_fkey` FOREIGN KEY (`householdId`) REFERENCES `households`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the default payment sources into every existing household so records have
-- a valid source to reference before the column is made required.
INSERT INTO `payment_sources` (`id`, `name`, `householdId`, `createdAt`)
SELECT UUID(), t.name, h.id, NOW(3)
FROM `households` h
CROSS JOIN (
    SELECT 'Cash' AS name
    UNION ALL SELECT 'Bank Transfer'
    UNION ALL SELECT 'Credit Card'
    UNION ALL SELECT 'PromptPay'
    UNION ALL SELECT 'GrabPay'
    UNION ALL SELECT 'TrueMoney Wallet'
) t;

-- AlterTable: add nullable first so existing rows can be backfilled.
ALTER TABLE `records` ADD COLUMN `paymentSourceId` VARCHAR(191) NULL;

-- Backfill existing records to their household's "Cash" source.
UPDATE `records` r
SET `paymentSourceId` = (
    SELECT ps.id FROM `payment_sources` ps
    WHERE ps.householdId = r.householdId AND ps.name = 'Cash'
    LIMIT 1
);

-- Now enforce NOT NULL.
ALTER TABLE `records` MODIFY COLUMN `paymentSourceId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `records_paymentSourceId_idx` ON `records`(`paymentSourceId`);

-- AddForeignKey
ALTER TABLE `records` ADD CONSTRAINT `records_paymentSourceId_fkey` FOREIGN KEY (`paymentSourceId`) REFERENCES `payment_sources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
