// A client is guaranteed to have at least one of business_name / name /
// phone (enforced in the save actions), so this always has something to
// show — falling back to "Cliente" only protects against stale/bad data.
export function clientDisplayName(client: {
  business_name?: string | null;
  name?: string | null;
  phone?: string | null;
}): string {
  return client.business_name || client.name || client.phone || "Cliente";
}
