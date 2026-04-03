"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Cat = "" | "MASS" | "GROUP" | "SOLO";

export function CastingCategoryFields({
  defaultCategory,
  defaultMass,
  defaultSolo,
  defaultGroup,
}: {
  defaultCategory?: string | null;
  defaultMass?: string;
  defaultSolo?: string;
  defaultGroup?: string[];
}) {
  const [cat, setCat] = useState<Cat>((defaultCategory as Cat) || "");

  const g = defaultGroup ?? [];
  return (
    <div className="space-y-4 rounded-md border border-dashed p-4">
      <div className="space-y-2">
        <Label htmlFor="castingCategory">Категория кастинга</Label>
        <select
          id="castingCategory"
          name="castingCategory"
          value={cat}
          onChange={(e) => setCat(e.target.value as Cat)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">— выберите —</option>
          <option value="MASS">Массовка (5–200 человек)</option>
          <option value="GROUP">Групповка (2–5 человек)</option>
          <option value="SOLO">Актёр (1 человек)</option>
        </select>
      </div>

      {cat === "MASS" && (
        <div className="space-y-2">
          <Label htmlFor="massRequirements">Общие черты толпы (возраст, внешность, телосложение)</Label>
          <Textarea
            id="massRequirements"
            name="massRequirements"
            rows={5}
            defaultValue={defaultMass}
            placeholder="Например: 25–45 лет, нейтральная одежда..."
          />
        </div>
      )}

      {cat === "GROUP" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">До 5 ролей — опишите каждую (внешность, волосы, пирсинг и т.д.)</p>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <Label htmlFor={`groupRole_${i}`}>Роль {i}</Label>
              <Textarea
                id={`groupRole_${i}`}
                name={`groupRole_${i}`}
                rows={2}
                defaultValue={g[i - 1] ?? ""}
              />
            </div>
          ))}
        </div>
      )}

      {cat === "SOLO" && (
        <div className="space-y-2">
          <Label htmlFor="soloRequirements">Требования к актёру</Label>
          <Textarea
            id="soloRequirements"
            name="soloRequirements"
            rows={6}
            defaultValue={defaultSolo}
            placeholder="Пол, возраст, типаж, навыки, тату, пирсинг..."
          />
        </div>
      )}
    </div>
  );
}
