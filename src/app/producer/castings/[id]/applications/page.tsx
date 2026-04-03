import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { listApplicationsForCasting } from "@/server/services/application.service";
import { ReviewDirection, ApplicationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CastPassedButton } from "@/components/cast-passed-button";
import { RejectApplicationButton } from "@/components/reject-application-button";
import { ReviewBlock } from "@/components/review-block";

export default async function CastingApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id: castingId } = await params;
  const profile = await prisma.producerProfile.findUnique({
    where: { userId: session!.user.id },
  });
  if (!profile) notFound();

  let applications;
  try {
    applications = await listApplicationsForCasting(castingId, profile.id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Отклики на кастинг</h1>
        <Link href={`/producer/castings/${castingId}/edit`}>
          <Button variant="outline" size="sm">
            К кастингу
          </Button>
        </Link>
      </div>
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{app.actorProfile.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {app.actorProfile.city.name} ·{" "}
                  <Link href={`/actors/${app.actorProfile.id}`} className="text-primary underline">
                    профиль
                  </Link>
                </p>
              </div>
              <Badge>{app.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {app.coverNote && <p>«{app.coverNote}»</p>}
              <div className="flex flex-wrap gap-2">
                {app.chat && (
                  <Link href={`/producer/chats/${app.chat.id}`}>
                    <Button size="sm" variant="outline">
                      Чат
                    </Button>
                  </Link>
                )}
                {app.status !== ApplicationStatus.CAST_PASSED &&
                  app.status !== ApplicationStatus.REJECTED &&
                  app.status !== ApplicationStatus.WITHDRAWN && (
                    <>
                      <CastPassedButton applicationId={app.id} />
                      <RejectApplicationButton applicationId={app.id} />
                    </>
                  )}
              </div>
              {app.status === ApplicationStatus.CAST_PASSED && (
                <ReviewBlock
                  applicationId={app.id}
                  direction={ReviewDirection.PRODUCER_TO_ACTOR}
                  existing={app.reviews.find(
                    (r) =>
                      r.direction === ReviewDirection.PRODUCER_TO_ACTOR && r.authorId === session!.user.id,
                  )}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
