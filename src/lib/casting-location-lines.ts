/** Отображение локации: новые поля или старое metroOrPlace. */
export function castingLocationParts(c: {
  metroStation?: string | null;
  addressLine?: string | null;
  metroOrPlace?: string | null;
}): { metro: string | null; address: string | null; legacy: string | null } {
  const metro = c.metroStation?.trim() || null;
  const address = c.addressLine?.trim() || null;
  const legacy = c.metroOrPlace?.trim() || null;
  if (metro || address) return { metro, address, legacy: null };
  return { metro: null, address: null, legacy };
}
