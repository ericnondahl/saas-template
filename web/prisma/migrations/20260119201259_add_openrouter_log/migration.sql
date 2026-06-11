-- CreateTable
CREATE TABLE "OpenRouterLog" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputText" TEXT NOT NULL,
    "outputText" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "inputCost" DECIMAL(10,8) NOT NULL,
    "outputCost" DECIMAL(10,8) NOT NULL,
    "totalCost" DECIMAL(10,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenRouterLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OpenRouterLog_createdAt_idx" ON "OpenRouterLog"("createdAt");

-- CreateIndex
CREATE INDEX "OpenRouterLog_model_idx" ON "OpenRouterLog"("model");
