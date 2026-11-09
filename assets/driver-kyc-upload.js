/* FRIEND RIDE — Driver KYC upload and profile save.
   Uses the existing private Storage bucket, fr_driver_documents table and
   own-profile RLS policy. Never stores an Aadhaar number in the public profile. */
(function () {
  'use strict';

  const KYC_BUCKET = 'driver-kyc-documents';
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'application/pdf'
  ]);
  const DOCUMENTS = [
    ['aadhaarFile', 'aadhaar', 'Aadhaar Card'],
    ['licenseFile', 'driving_license', 'Driving Licence'],
    ['rcFile', 'vehicle_rc', 'Vehicle RC']
  ];

  function fileExtension(file) {
    const ext = String(file.name || '').split('.').pop().toLowerCase();
    if (/^(jpe?g|png|webp|pdf)$/.test(ext)) return ext === 'jpeg' ? 'jpg' : ext;
    return ({
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'application/pdf': 'pdf'
    })[file.type] || 'bin';
  }

  function statusText(message, isError) {
    const card = document.getElementById('driverReg')?.closest('.card');
    const notice = card?.querySelector('.notice');
    if (notice) {
      notice.textContent = message;
      notice.style.color = isError ? '#b42335' : '';
    }
    if (typeof window.showMessage === 'function') {
      window.showMessage(message, isError ? 'bad' : 'good');
    }
  }

  function validateFile(file, label) {
    if (!file) throw new Error(label + ' document upload చేయండి.');
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error(label + ' JPG, PNG, WEBP లేదా PDF formatలో ఉండాలి.');
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      throw new Error(label + ' file 5 MB లోపు ఉండాలి.');
    }
  }

  async function uploadPrivateFile(file, documentType) {
    const token = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + '_' + Math.random().toString(36).slice(2);
    const path = currentUser.id + '/' + documentType + '_' + token + '.' + fileExtension(file);
    const { error } = await sb.storage.from(KYC_BUCKET).upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    });
    if (error) throw error;
    return path;
  }

  window.saveDriverDetails = async function saveDriverDetails() {
    const uploaded = [];
    try {
      if (!currentUser?.id || !currentProfile || currentProfile.role !== 'driver' || selectedRole !== 'driver') {
        throw new Error('Driver accountతో Login చేయండి.');
      }

      const vehicleType = document.getElementById('driverVehicle')?.value || '';
      const vehicleModel = (document.getElementById('driverModel')?.value || '').trim();
      const vehicleRegistration = (document.getElementById('driverReg')?.value || '').trim().toUpperCase();
      const drivingLicenseNumber = (document.getElementById('driverLicense')?.value || '').trim().toUpperCase();
      const experienceRaw = document.getElementById('driverExperience')?.value ?? '';
      const experience = experienceRaw === '' ? null : Number(experienceRaw);

      if (!['Bike', 'Auto', 'Car'].includes(vehicleType)) throw new Error('Vehicle Type ఎంచుకోండి.');
      if (vehicleRegistration.length < 5 || vehicleRegistration.length > 20) throw new Error('Valid Vehicle Registration Number నమోదు చేయండి.');
      if (!/^[A-Z0-9 \/-]{5,30}$/.test(drivingLicenseNumber)) throw new Error('Valid Driving Licence Number నమోదు చేయండి.');
      if (experience !== null && (!Number.isInteger(experience) || experience < 0 || experience > 60)) {
        throw new Error('Driving Experience 0 నుంచి 60 సంవత్సరాల మధ్య ఉండాలి.');
      }

      const files = DOCUMENTS.map(([inputId, type, label]) => {
        const file = document.getElementById(inputId)?.files?.[0];
        validateFile(file, label);
        return { type, label, file };
      });

      const { data: existing, error: existingError } = await sb
        .from('fr_driver_documents')
        .select('document_type,storage_path,verification_status')
        .eq('driver_id', currentUser.id);
      if (existingError) throw existingError;
      const existingRows = existing || [];
      const locked = existingRows.filter(x =>
        ['verified', 'rejected'].includes(String(x.verification_status || '').toLowerCase())
      );
      if (locked.length) {
        throw new Error('మీ KYC documents ఇప్పటికే Admin review చేశారు. Re-upload కోసం Adminను సంప్రదించండి.');
      }

      const previousPaths = existingRows.map(x => x.storage_path).filter(Boolean);
      for (const item of files) {
        const path = await uploadPrivateFile(item.file, item.type);
        uploaded.push({ type: item.type, path });
      }

      const documentRows = uploaded.map(item => ({
        driver_id: currentUser.id,
        owner_id: currentUser.id,
        document_type: item.type,
        storage_path: item.path,
        verification_status: 'pending'
      }));
      const { error: documentsError } = await sb
        .from('fr_driver_documents')
        .upsert(documentRows, { onConflict: 'driver_id,document_type' });
      if (documentsError) throw documentsError;

      const paths = Object.fromEntries(uploaded.map(x => [x.type, x.path]));
      const profileUpdate = {
        vehicle_type: vehicleType,
        vehicle_model: vehicleModel || null,
        vehicle_registration: vehicleRegistration,
        driving_license_number: drivingLicenseNumber,
        driving_experience_years: experience,
        driver_aadhaar_document_path: paths.aadhaar,
        driving_license_document_path: paths.driving_license,
        vehicle_rc_document_path: paths.vehicle_rc
      };
      const { data: saved, error: profileError } = await sb
        .from('profiles')
        .update(profileUpdate)
        .eq('id', currentUser.id)
        .select('id')
        .maybeSingle();
      if (profileError) throw profileError;
      if (!saved?.id) throw new Error('Driver profile save confirmation రాలేదు.');

      Object.assign(currentProfile, profileUpdate);

      const replaced = previousPaths.filter(oldPath => !uploaded.some(x => x.path === oldPath));
      if (replaced.length) {
        await sb.storage.from(KYC_BUCKET).remove(replaced).catch(() => {});
      }

      DOCUMENTS.forEach(([inputId]) => {
        const input = document.getElementById(inputId);
        if (input) input.value = '';
      });
      statusText('Driver వివరాలు మరియు 3 KYC documents private storageలో సేవ్ అయ్యాయి. Admin verification పూర్తయ్యే వరకు Driver approval Pendingలో ఉంటుంది.', false);
    } catch (error) {
      // If no document rows were saved, remove any files uploaded in this attempt.
      if (uploaded.length) {
        try {
          const { data: rows } = await sb.from('fr_driver_documents')
            .select('storage_path')
            .eq('driver_id', currentUser?.id || '');
          const referenced = new Set((rows || []).map(x => x.storage_path));
          const orphaned = uploaded.map(x => x.path).filter(path => !referenced.has(path));
          if (orphaned.length) await sb.storage.from(KYC_BUCKET).remove(orphaned);
        } catch (_) {}
      }
      statusText('Driver details save కాలేదు: ' + (error?.message || error), true);
    }
  };
})();
