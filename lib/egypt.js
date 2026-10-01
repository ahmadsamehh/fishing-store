export const GOVERNORATES = [
  'Cairo', 'Giza', 'Alexandria', 'Qalyubia', 'Sharqia', 'Dakahlia', 'Gharbia', 'Monufia', 'Beheira',
  'Kafr El Sheikh', 'Damietta', 'Port Said', 'Ismailia', 'Suez', 'North Sinai', 'South Sinai', 'Red Sea',
  'Fayoum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag', 'Qena', 'Luxor', 'Aswan', 'Matrouh', 'New Valley',
];

// Accepts Egyptian mobiles like 01012345678, +201012345678 or 00201012345678.
export function isValidPhone(v) {
  const d = (v || '').replace(/[\s-]/g, '');
  return /^(\+20|0020|0)?1[0125]\d{8}$/.test(d) || /^\+?\d{10,15}$/.test(d);
}
