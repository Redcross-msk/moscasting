import {
  AvailabilityStatus,
  BodyType,
  EthnicAppearance,
  FacialHairOption,
  Gender,
  TattooPiercingOption,
} from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ACTOR_LANGUAGE_OPTIONS,
  ACTOR_PROFESSIONAL_SKILL_OPTIONS,
  ethnicAppearanceLabel,
  facialHairLabel,
  tattooPiercingLabel,
} from "@/lib/actor-form-constants";
import { availabilityLabel, bodyTypeLabel, genderLabel } from "@/lib/profile-labels";

export type ActorAnketaDefaults = {
  fullName?: string;
  birthDate?: string;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  bodyType?: BodyType;
  ethnicAppearance?: EthnicAppearance;
  tattooPiercingOption?: TattooPiercingOption;
  facialHairOption?: FacialHairOption;
  languages?: string[];
  professionalSkillKeys?: string[];
  bio?: string;
  availability?: AvailabilityStatus;
};

const fieldClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ActorAnketaFields({ defaults }: { defaults?: ActorAnketaDefaults }) {
  const langSet = new Set(defaults?.languages ?? []);
  const profSet = new Set(defaults?.professionalSkillKeys ?? []);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-primary">Основное</h3>
        <div className="space-y-2">
          <Label htmlFor="fullName">ФИО</Label>
          <Input id="fullName" name="fullName" required defaultValue={defaults?.fullName} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthDate">Дата рождения</Label>
            <Input id="birthDate" name="birthDate" type="date" required defaultValue={defaults?.birthDate} />
          </div>
          <div className="space-y-2">
            <Label>Пол</Label>
            <select name="gender" required defaultValue={defaults?.gender} className={fieldClass}>
              {Object.values(Gender).map((g) => (
                <option key={g} value={g}>
                  {genderLabel[g]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="heightCm">Рост (см)</Label>
            <Input
              id="heightCm"
              name="heightCm"
              type="number"
              min={100}
              max={250}
              required
              defaultValue={defaults?.heightCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weightKg">Вес (кг)</Label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              min={35}
              max={200}
              required
              defaultValue={defaults?.weightKg}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Телосложение</Label>
          <select name="bodyType" required defaultValue={defaults?.bodyType} className={fieldClass}>
            {Object.values(BodyType).map((b) => (
              <option key={b} value={b}>
                {bodyTypeLabel[b]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">Языки</h3>
        <p className="text-xs text-muted-foreground">Отметьте все подходящие варианты.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {ACTOR_LANGUAGE_OPTIONS.map((o) => (
            <label key={o.slug} className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50">
              <input type="checkbox" name="languages" value={o.slug} defaultChecked={langSet.has(o.slug)} />
              {o.label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">Внешность</h3>
        <div className="space-y-2">
          <Label>Тип внешности</Label>
          <select
            name="ethnicAppearance"
            required
            defaultValue={defaults?.ethnicAppearance}
            className={fieldClass}
          >
            {Object.values(EthnicAppearance).map((v) => (
              <option key={v} value={v}>
                {ethnicAppearanceLabel[v]}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Татуировки и пирсинг</legend>
          <p className="text-xs text-muted-foreground">Выберите один вариант.</p>
          <div className="space-y-2">
            {Object.values(TattooPiercingOption).map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <input
                  type="radio"
                  name="tattooPiercingOption"
                  value={v}
                  required
                  defaultChecked={defaults?.tattooPiercingOption === v}
                  className="mt-1"
                />
                <span>{tattooPiercingLabel[v]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Борода и усы</legend>
          <p className="text-xs text-muted-foreground">Выберите один вариант.</p>
          <div className="space-y-2">
            {Object.values(FacialHairOption).map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <input
                  type="radio"
                  name="facialHairOption"
                  value={v}
                  required
                  defaultChecked={defaults?.facialHairOption === v}
                  className="mt-1"
                />
                <span>{facialHairLabel[v]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-primary">Профессиональные навыки</h3>
        <p className="text-xs text-muted-foreground">Можно выбрать несколько.</p>
        <div className="grid gap-2 sm:grid-cols-1 md:grid-cols-2">
          {ACTOR_PROFESSIONAL_SKILL_OPTIONS.map((o) => (
            <label
              key={o.slug}
              className="flex cursor-pointer items-start gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted/50"
            >
              <input
                type="checkbox"
                name="professionalSkills"
                value={o.slug}
                defaultChecked={profSet.has(o.slug)}
                className="mt-0.5"
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-primary">О себе</h3>
        <Label htmlFor="bio" className="text-muted-foreground">
          Расскажите о себе то, что считаете нужным
        </Label>
        <Textarea
          id="bio"
          name="bio"
          required
          rows={5}
          placeholder="Например: опыт съёмок, образование, особенности графика…"
          defaultValue={defaults?.bio}
          className="min-h-[120px] resize-y"
        />
      </section>

      <section className="space-y-2">
        <Label>Доступность по графику</Label>
        <select name="availability" defaultValue={defaults?.availability ?? AvailabilityStatus.AVAILABLE} className={fieldClass}>
          {Object.values(AvailabilityStatus).map((a) => (
            <option key={a} value={a}>
              {availabilityLabel[a]}
            </option>
          ))}
        </select>
      </section>
    </div>
  );
}
