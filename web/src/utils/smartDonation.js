export const calculateUrgency = (preparedAt, expiryAt) => {
  const now = new Date().getTime();
  const exp = new Date(expiryAt).getTime();
  const hoursLeft = (exp - now) / (1000 * 60 * 60);

  if (hoursLeft <= 2) return { status: 'HIGH_URGENCY', label: 'Urgent (Expires in < 2 hrs)', color: '#c62828' };
  if (hoursLeft <= 6) return { status: 'MEDIUM_URGENCY', label: 'Moderate (Expires in < 6 hrs)', color: '#e65100' };
  return { status: 'NORMAL', label: 'Normal (Fresh)', color: '#2e7d32' };
};

export const matchNearbyNGOs = (donationLocation, ngosList) => {
  if (!ngosList || ngosList.length === 0) return [];
  return ngosList.slice(0, 3);
};

export const getLatestDonation = () => {
  return {
    id: 1,
    foodName: 'Veg Biryani Packs',
    quantity: 15,
    unit: 'Packs',
    address: 'Banjara Hills, Hyderabad',
    status: 'ACCEPTED',
  };
};

export const calculateDonorImpact = (donations) => {
  let totalSavedKg = 0;
  let totalPeopleHelped = 0;
  (donations || []).forEach((d) => {
    const qty = Number(d.quantity) || 1;
    totalSavedKg += d.unit === 'Kg' ? qty : qty * 2.5;
    totalPeopleHelped += qty * 3;
  });
  return {
    totalSavedKg: Math.round(totalSavedKg),
    totalPeopleHelped: Math.round(totalPeopleHelped),
  };
};

export const calculatePlatformImpact = (donations) => {
  let totalSavedKg = 0;
  let totalPeopleHelped = 0;
  (donations || []).forEach((d) => {
    const qty = Number(d.quantity) || 1;
    totalSavedKg += d.unit === 'Kg' ? qty : qty * 2.5;
    totalPeopleHelped += qty * 3;
  });
  return {
    totalSavedKg: Math.round(totalSavedKg),
    totalPeopleHelped: Math.round(totalPeopleHelped),
  };
};

export const getDemoNGOs = () => [
  { id: 1, name: 'Annamrita Foundation', address: 'Secunderabad' },
  { id: 2, name: 'Robin Hood Army', address: 'Jubilee Hills' },
];

export const getDemoVolunteers = () => [
  { id: 1, name: 'Rohan Sharma', phone: '+91 98765 43210' },
  { id: 2, name: 'Priya Verma', phone: '+91 98765 43211' },
];

export const matchDonorWithNGO = (donor, ngos) => {
  return ngos?.[0] || null;
};
