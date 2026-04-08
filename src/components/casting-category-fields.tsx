"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Cat = "" | "MASS" | "GROUP" | "SOLO";

const MASS_PLACEHOLDER =
  "Мужчины и женщины от 25 до 45 лет\nСпортивное телосложение\nБез татуировок и пирсинга\nРост выше 180 см, вес не больше 70 кг";

const SOLO_PLACEHOLDER =
  "Молодой человек от 20 до 22 лет, волосы каштановые, стрижка бокс, телосложение спортивное, без тату и пирсинга, сцена в боксерском зале, требуется выполнение физических упражнений + произнесение текста…";

const GROUP_PLACEHOLDERS = [
  "Роль 1: парень 20 лет, без бороды, с длинными волосами, рост от 180 см, худощавое телосложение…",
  "Роль 2: девушка 18 лет, блондинка, длинные волосы, телосложение спортивное, рост от 150 до 160 см, в кадре занимается спортом…",
  "Роль 3: мужчина 38 лет, с бородой и татуировками, телосложение крупное, лысый, роль байкера…",
  "Роль 4: женщина 55 лет, крупного телосложения, с красными волосами, роль — продавщица в магазине…",
  "Роль 5: собака, золотистый кокер-спаниель, умеет слушать команды сидеть, пойдём, роль — пес главной героини…",
] as const;

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
          <Label htmlFor="massRequirements">Требования к массовке</Label>
          <Textarea
            id="massRequirements"
            name="massRequirements"
            rows={6}
            defaultValue={defaultMass}
            placeholder={MASS_PLACEHOLDER}
          />
        </div>
      )}

      {cat === "GROUP" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">До 5 ролей — опишите каждую.</p>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1">
              <Label htmlFor={`groupRole_${i}`}>Роль {i}</Label>
              <Textarea
                id={`groupRole_${i}`}
                name={`groupRole_${i}`}
                rows={3}
                defaultValue={g[i - 1] ?? ""}
                placeholder={GROUP_PLACEHOLDERS[i - 1]}
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
            rows={7}
            defaultValue={defaultSolo}
            placeholder={SOLO_PLACEHOLDER}
          />
        </div>
      )}
    </div>
  );
}
