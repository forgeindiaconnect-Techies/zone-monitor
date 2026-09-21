export const DEFAULT_HOST_OPTIONS = [
  { label: 'Priyadharshini (HR)', name: 'Priyadharshini', dbName: 'PRIYADHARSHINI' },
  { label: 'Ganesh Kumar (HR)', name: 'Ganesh Kumar', dbName: 'GANESH KUMAR' },
  { label: 'Sandeep (CEO Sir)', name: 'Sandeep', dbName: 'SANDEEP' },
  { label: 'Avinash (MD Sir)', name: 'Avinash', dbName: 'AVINASH' },
  { label: 'Sabari (Admin)', name: 'Sabari', dbName: 'SABARI' },
  { label: 'Agila (IT)', name: 'Agila', dbName: 'AGILA' },
  { label: 'Joe Christo (Senior HR)', name: 'Joe Christo', dbName: 'JOE CHRISTO' }
];

export const buildHostOptions = (dbUsers = []) => {
  // Start with the exact predefined default hosts with their custom designations
  const result = DEFAULT_HOST_OPTIONS.map(def => {
    const matched = (dbUsers || []).find(u => {
      const uName = (u.name || '').toLowerCase().replace(/\s+/g, '');
      const defName = def.name.toLowerCase().replace(/\s+/g, '');
      return uName.includes(defName) || defName.includes(uName);
    });
    return {
      ...def,
      id: matched?._id || matched?.id || '',
      email: matched?.email || ''
    };
  });

  // Append any newly created users from User Management (e.g., Hema, etc.) that aren't already in the default list
  if (Array.isArray(dbUsers)) {
    dbUsers.forEach(u => {
      const uName = (u.name || '').trim();
      if (!uName) return;
      const lower = uName.toLowerCase();
      // Ignore direct visits / system / test / excluded users if in db
      const roleLower = (u.role || '').toLowerCase();
      if (
        lower.includes('direct visit') ||
        lower === 'system' ||
        lower === 'admin user' ||
        lower.includes('test') ||
        lower.includes('gowtham') ||
        lower.includes('fic super admin') ||
        lower.includes('saas admin') ||
        lower.includes('super admin') ||
        roleLower.includes('super admin') ||
        roleLower.includes('saas') ||
        roleLower.includes('security') ||
        roleLower.includes('visitor')
      ) return;

      const alreadyInList = result.some(item => {
        const iName = item.name.toLowerCase().replace(/\s+/g, '');
        const currentName = uName.toLowerCase().replace(/\s+/g, '');
        return iName === currentName || currentName.includes(iName) || iName.includes(currentName);
      });

      if (!alreadyInList) {
        const label = u.role ? `${uName} (${u.role})` : uName;
        result.push({
          label,
          name: uName,
          id: u._id || u.id || '',
          dbName: uName.toUpperCase(),
          email: u.email || ''
        });
      }
    });
  }

  // Always append 'Direct Visits' at the end
  result.push({
    label: 'Direct Visits',
    name: 'Direct Visits',
    id: '',
    dbName: 'DIRECT VISITS'
  });

  return result;
};

export const getHostStringList = (dbUsers = []) => {
  const options = buildHostOptions(dbUsers);
  return options.map(o => o.label);
};
