BEGIN TRY
BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Order] ADD [shippingAddress] NVARCHAR(1000),
[shippingMethod] NVARCHAR(1000),
[total] FLOAT(53);

-- AlterTable
ALTER TABLE [dbo].[OrderItem] ADD [price] FLOAT(53);

-- CreateTable
CREATE TABLE [dbo].[Review] (
    [id] INT NOT NULL IDENTITY(1,1),
    [rating] INT NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [body] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Review_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [customerId] INT NOT NULL,
    [productId] INT NOT NULL,
    CONSTRAINT [Review_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Review] ADD CONSTRAINT [Review_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[Product]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;
END TRY
BEGIN CATCH
IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW
END CATCH