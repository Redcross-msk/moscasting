-- AlterTable
ALTER TABLE "ProducerActorDirectThread" ADD COLUMN "lastSeenAtProducer" TIMESTAMP(3),
ADD COLUMN "lastSeenAtActor" TIMESTAMP(3);
