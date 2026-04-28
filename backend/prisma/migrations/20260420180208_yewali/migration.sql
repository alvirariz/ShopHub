BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[ProductView] (
    [id] INT NOT NULL IDENTITY(1,1),
    [productId] INT NOT NULL,
    [customerId] INT NOT NULL,
    [viewedAt] DATETIME2 NOT NULL CONSTRAINT [ProductView_viewedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [ProductView_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[ProductView] ADD CONSTRAINT [ProductView_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[Product]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
