export type StoredLocalMember = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  spiritualBirthday: string | null;
  family?: { id: number; name: string; relation: string }[];
  groups: string[];
  /** Ids de documentos en la colección `churches` (puede incluir `otro`). */
  churchIds?: string[];
  membershipStatus: string;
  photoDataUrl: string | null;
};

const STORAGE_KEY = 'digital-church-local-members-v1';

function readAll(): StoredLocalMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as StoredLocalMember[];
  } catch {
    return [];
  }
}

function writeAll(members: StoredLocalMember[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function getLocalMembers(): StoredLocalMember[] {
  return readAll();
}

export type NewMemberFormPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dob: Date;
  spiritualBirthday?: Date;
  groups: string[];
  churchIds?: string[];
  membershipStatus: string;
};

export function addLocalMember(
  values: NewMemberFormPayload,
  photoDataUrl: string | null
): StoredLocalMember {
  const record: StoredLocalMember = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    address: values.address,
    dob: values.dob.toISOString(),
    spiritualBirthday: values.spiritualBirthday
      ? values.spiritualBirthday.toISOString()
      : null,
    groups: [...values.groups],
    churchIds:
      values.churchIds && values.churchIds.length > 0
        ? [...values.churchIds]
        : undefined,
    membershipStatus: values.membershipStatus,
    photoDataUrl,
  };

  const all = readAll();
  all.push(record);
  writeAll(all);
  return record;
}
