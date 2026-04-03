export function parseRoleRequirementsJson(json: unknown): {
  mass?: string;
  solo?: string;
  group: string[];
} {
  const empty = ["", "", "", "", ""];
  if (!json || typeof json !== "object") return { group: empty };
  const o = json as Record<string, unknown>;
  if (o.type === "mass" && typeof o.text === "string") return { mass: o.text, group: empty };
  if (o.type === "solo" && typeof o.text === "string") return { solo: o.text, group: empty };
  if (o.type === "group" && Array.isArray(o.roles)) {
    const g = [...empty];
    o.roles.forEach((r, i) => {
      if (i < 5) g[i] = String(r ?? "");
    });
    return { group: g };
  }
  return { group: empty };
}
