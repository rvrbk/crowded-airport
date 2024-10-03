-- CreateTable
CREATE TABLE "Airport" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "iata" TEXT NOT NULL,
    "icao" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "altitude" INTEGER NOT NULL,
    "timezone" TEXT,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("id")
);
