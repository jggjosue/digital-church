'use client';

import * as React from 'react';
import { MembersDirectoryClient } from '../members-directory-client';
import { STAFF_DIRECTORY_ROLES_QUERY } from '@/lib/staff-directory-roles';

export default function MembersStaffPage() {
  const extraMembersSearchParams = React.useMemo(
    () => ({ staffRoles: STAFF_DIRECTORY_ROLES_QUERY }),
    []
  );

  return (
    <MembersDirectoryClient
      title="Personal y cargos"
      description="Miembros con cargos pastorales, de directiva, comisiones, instituto y dirección general en sus templos."
      extraMembersSearchParams={extraMembersSearchParams}
      showAddMemberButton={false}
      emptyDirectoryMessage="No hay miembros con estos cargos en los templos a los que tiene acceso, o el listado está vacío."
    />
  );
}
