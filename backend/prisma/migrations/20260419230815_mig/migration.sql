BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] INT NOT NULL IDENTITY(1,1),
    [message] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [isRead] BIT NOT NULL CONSTRAINT [Notification_isRead_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] INT NOT NULL,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Wishlist] (
    [id] INT NOT NULL IDENTITY(1,1),
    [userId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Wishlist_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Wishlist_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Wishlist_userId_key] UNIQUE NONCLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[WishlistItem] (
    [id] INT NOT NULL IDENTITY(1,1),
    [wishlistId] INT NOT NULL,
    [productId] INT NOT NULL,
    [addedAt] DATETIME2 NOT NULL CONSTRAINT [WishlistItem_addedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [WishlistItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[WishlistItem] ADD CONSTRAINT [WishlistItem_wishlistId_fkey] FOREIGN KEY ([wishlistId]) REFERENCES [dbo].[Wishlist]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[WishlistItem] ADD CONSTRAINT [WishlistItem_productId_fkey] FOREIGN KEY ([productId]) REFERENCES [dbo].[Product]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
