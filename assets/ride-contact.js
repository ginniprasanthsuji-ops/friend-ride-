var FRRideContact;
(function (FRRideContact) {
    const first = (row, keys) => {
        for (const key of keys) {
            const value = row[key];
            if (value !== null && value !== undefined && String(value).trim() !== '')
                return String(value).trim();
        }
        return '';
    };
    function phone(row) {
        return first(row, ['phone', 'phone_number', 'phone_e164', 'mobile', 'mobile_number', 'contact_phone', 'profile_phone']);
    }
    FRRideContact.phone = phone;
    function fullName(row) {
        return first(row, ['full_name', 'name', 'customer_name', 'driver_name', 'display_name']);
    }
    FRRideContact.fullName = fullName;
    function profilePhoto(row, role) {
        return role === 'driver'
            ? first(row, ['driver_profile_photo_path', 'driver_photo_path', 'profile_photo_path', 'avatar_path', 'photo_path'])
            : first(row, ['customer_profile_photo_path', 'profile_photo_path', 'customer_photo_path', 'avatar_path', 'photo_path']);
    }
    FRRideContact.profilePhoto = profilePhoto;
    function vehicleRegistration(row) {
        return first(row, ['vehicle_registration', 'vehicle_number', 'registration_number', 'vehicle_reg_no', 'rc_number']);
    }
    FRRideContact.vehicleRegistration = vehicleRegistration;
    function normalize(row) {
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
    FRRideContact.normalize = normalize;
    function confirmedStatus(status) {
        return ['accepted', 'confirmed', 'ongoing', 'in_progress', 'started'].includes(String(status !== null && status !== void 0 ? status : '').trim().toLowerCase());
    }
    FRRideContact.confirmedStatus = confirmedStatus;
})(FRRideContact || (FRRideContact = {}));
globalThis.FRRideContact = FRRideContact;
