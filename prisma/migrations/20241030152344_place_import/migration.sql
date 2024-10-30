-- CreateTable
CREATE TABLE "PlacesImport" (
    "id" SERIAL NOT NULL,
    "place_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlacesImport_pkey" PRIMARY KEY ("id")
);
