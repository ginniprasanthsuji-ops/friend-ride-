namespace FRRideContact {
  export type Row = Record<string, unknown>;

  const first = (row: Row, keys: string[]): string => {
    for (const key of keys) {
      const value = row[key];
      if (value !== null && value !== undefined && String(value).trim() !== '') return String(value).trim();
    }
    return '';
  };

  export function phone(row: Row): string {
    return first(row, ['phone', 'phone_number', 'phone_e164', 'mobile', 'mobile_number', 'contact_phone', 'profile_phone']);
  }
  export function fullName(row: Row): string {
    return first(row, ['full_name', 'name', 'customer_name', 'driver_name', 'display_name']);
  }
  export function profilePhoto(row: Row, role: 'driver' | 'customer'): string {
    return role === 'driver'
      ? first(row, ['driver_profile_photo_path', 'driver_photo_path', 'profile_photo_path', 'avatar_path', 'photo_path'])
      : first(row, ['customer_profile_photo_path', 'profile_photo_path', 'customer_photo_path', 'avatar_path', 'photo_path']);
  }
  export function vehicleRegistration(row: Row): string {
    return first(row, ['vehicle_registration', 'vehicle_number', 'registration_number', 'vehicle_reg_no', 'rc_number']);
  }
  export function normalize(row: Row): Row {
    return {
      ...row,
      full_name: fullName(row),
      phone: phone(row),
      driver_profile_photo_path: profilePhoto(row, 'driver'),
      customer_profile_photo_path: profilePhoto(row, 'customer'),
      vehicle_company: first(row, ['vehicle_company', 'vehicle_make', 'company']),
      vehicle_model: first(row, ['vehicle_model', 'model']),
      vehicle_registration: vehicleRegistration(row),
    };
  }
  export function confirmedStatus(status: unknown): boolean {
    return ['accepted', 'confirmed', 'ongoing', 'in_progress', 'started'].includes(String(status ?? '').trim().toLowerCase());
  }
}
(globalThis as typeof globalThis & { FRRideContact?: typeof FRRideContact }).FRRideContact = FRRideContact;
