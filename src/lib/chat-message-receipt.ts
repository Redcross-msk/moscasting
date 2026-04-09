export type ChatMessageReceipt = "none" | "sent" | "read";

/** Статусы для чата по отклику: исходящие — прочитал ли собеседник; входящие — отметили ли вы прочтение. */
export function applicationChatMessageReceipt(opts: {
  isMine: boolean;
  viewerUserId: string;
  counterpartyUserId: string;
  reads: { userId: string }[];
}): ChatMessageReceipt {
  const { isMine, viewerUserId, counterpartyUserId, reads } = opts;
  if (isMine) {
    const readByCounterparty = reads.some((r) => r.userId === counterpartyUserId);
    return readByCounterparty ? "read" : "sent";
  }
  const readByViewer = reads.some((r) => r.userId === viewerUserId);
  return readByViewer ? "read" : "sent";
}

/** Статусы для личного треда по lastSeen до текущего открытия (mark read вызывается после загрузки). */
export function directThreadMessageReceipt(opts: {
  isMine: boolean;
  viewerUserId: string;
  producerUserId: string;
  actorUserId: string;
  messageCreatedAt: Date;
  lastSeenAtProducer: Date | null;
  lastSeenAtActor: Date | null;
}): ChatMessageReceipt {
  const t = opts.messageCreatedAt.getTime();
  if (opts.isMine) {
    const peerSeen =
      opts.viewerUserId === opts.producerUserId ? opts.lastSeenAtActor : opts.lastSeenAtProducer;
    return peerSeen != null && peerSeen.getTime() >= t ? "read" : "sent";
  }
  const mySeen =
    opts.viewerUserId === opts.producerUserId ? opts.lastSeenAtProducer : opts.lastSeenAtActor;
  return mySeen != null && mySeen.getTime() >= t ? "read" : "sent";
}
