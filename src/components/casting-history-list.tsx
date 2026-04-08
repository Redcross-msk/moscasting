"use client";

import { CastingRow, type SerializedHomeCasting } from "@/components/home-public-browse";

const STATUS_RU: Record<string, string> = {
  ACCEPTED: "Принят",
  INVITED: "Приглашение",
  CAST_PASSED: "Кастинг пройден",
};

export function CastingHistoryList({
  rows,
}: {
  rows: { serialized: SerializedHomeCasting; status: string }[];
}) {
  return (
    <div className="space-y-4">
      {rows.map(({ serialized, status }) => (
        <CastingRow
          key={serialized.id}
          c={serialized}
          canBrowse
          loading={false}
          onNeedAuth={() => {}}
          historyMode
          statusFooter={STATUS_RU[status] ?? status}
        />
      ))}
    </div>
  );
}
