import { useState, useEffect } from 'react';

const DEFAULT_TROPHIES = [
  { competitionName: '', seasonIdentifier: '', year: '', manager: '', captain: '', finalResult: '' },
  { competitionName: '', seasonIdentifier: '', year: '', manager: '', captain: '', finalResult: '' },
];

const emptyForm = {
  clubName: '',
  homepageHeadline: '',
  clubDescription: '',
  founded: '',
  ground: '',
  league: '',
  contactEmail: '',
  socialHandle: '',
  trophies: DEFAULT_TROPHIES.map((entry) => ({ ...entry }))
};

const ClubSettings = () => {
  const [settings, setSettings] = useState({ ...emptyForm, logoUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data.settings);
      setForm({
        clubName: data.settings.clubName || '',
        homepageHeadline: data.settings.homepageHeadline || '',
        clubDescription: data.settings.clubDescription || '',
        founded: data.settings.founded || '',
        ground: data.settings.ground || '',
        league: data.settings.league || '',
        contactEmail: data.settings.contactEmail || '',
        socialHandle: data.settings.socialHandle || '',
        trophies: data.settings.trophies?.length
          ? data.settings.trophies
          : DEFAULT_TROPHIES.map((entry) => ({ ...entry }))
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Validate club name
  const validateForm = () => {
    if (form.clubName.length < 3 || form.clubName.length > 100) {
      return { clubName: 'Club name must be between 3 and 100 characters' };
    }

    if (form.founded && (Number(form.founded) < 1800 || Number(form.founded) > 3000)) {
      return { founded: 'Founded year must be a valid year' };
    }

    const trophyError = form.trophies.some((entry) => (entry.competitionName && !entry.year) || (!entry.competitionName && entry.year));
    if (trophyError) {
      return { trophies: 'Each trophy row needs both a competition name and a year' };
    }

    return {};
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const updateTrophy = (index, field, value) => {
    setForm((current) => ({
      ...current,
      trophies: current.trophies.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const handleAddTrophy = () => {
    setForm((current) => ({
      ...current,
      trophies: [...current.trophies, { competitionName: '', seasonIdentifier: '', year: '', manager: '', captain: '', finalResult: '' }].slice(0, 8)
    }));
  };

  const handleRemoveTrophy = (index) => {
    setForm((current) => ({
      ...current,
      trophies: current.trophies.filter((_, entryIndex) => entryIndex !== index)
    }));
  };

  const handleUpdateClubSettings = async (e) => {
    e.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        clubName: form.clubName,
        homepageHeadline: form.homepageHeadline,
        clubDescription: form.clubDescription,
        founded: form.founded ? Number(form.founded) : undefined,
        ground: form.ground,
        league: form.league,
        contactEmail: form.contactEmail,
        socialHandle: form.socialHandle,
        trophies: form.trophies.filter((entry) => entry.competitionName && entry.year)
      };

      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update club settings');
      }

      const data = await response.json();
      setSettings(data.settings);
      setForm({
        clubName: data.settings.clubName || '',
        homepageHeadline: data.settings.homepageHeadline || '',
        clubDescription: data.settings.clubDescription || '',
        founded: data.settings.founded || '',
        ground: data.settings.ground || '',
        league: data.settings.league || '',
        contactEmail: data.settings.contactEmail || '',
        socialHandle: data.settings.socialHandle || '',
        trophies: data.settings.trophies?.length
          ? data.settings.trophies
          : DEFAULT_TROPHIES.map((entry) => ({ ...entry }))
      });
      setIsEditing(false);
      showToast('Club settings updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors({ logo: 'Only JPEG, PNG, and WebP files are allowed' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ logo: 'File size must be less than 5MB' });
      return;
    }

    setErrors({});
    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile) {
      console.error('❌ Logo upload failed: No file selected');
      return;
    }

    console.log('🚀 Starting logo upload...', {
      fileName: logoFile.name,
      fileSize: logoFile.size,
      fileType: logoFile.type
    });

    setUploading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('❌ Logo upload failed: No auth token found');
        throw new Error('Authentication token missing');
      }

      const formData = new FormData();
      formData.append('logo', logoFile);

      console.log('📤 Sending upload request to:', `${API_URL}/api/settings/logo`);

      const response = await fetch(`${API_URL}/api/settings/logo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      console.log('📥 Upload response status:', response.status, response.statusText);

      let data = null;
      try {
        data = await response.json();
        console.log('📦 Response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        data = null;
      }

      if (!response.ok) {
        console.error('❌ Upload request failed:', response.status, data);
        throw new Error(data?.message || 'Failed to upload logo');
      }

      const uploadedLogoUrl = data.logoUrl ? `${data.logoUrl}?v=${Date.now()}` : data.logoUrl;
      console.log('✅ Logo uploaded successfully:', uploadedLogoUrl);
      setSettings(prev => ({ ...prev, logoUrl: uploadedLogoUrl }));
      setLogoFile(null);
      setLogoPreview(null);
      showToast('Logo uploaded successfully');
      fetchSettings();
    } catch (err) {
      console.error('❌ Logo upload error:', err);
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-white">Loading settings...</div>;
  }

  const logoSrc = settings?.logoUrl
    ? settings.logoUrl.startsWith('http') ? settings.logoUrl : `${API_URL}${settings.logoUrl}`
    : null;

  return (
    <div className="p-4">
      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-4 rounded-2xl backdrop-blur-sm ${
          toast.type === 'error' ? 'bg-red-900/40 text-red-200 border border-red-500/30' : 'bg-green-900/40 text-green-200 border border-green-500/30'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_0.4fr]">
        {/* Left Column - Club Content */}
        <div className="bg-gray-800/40 backdrop-blur-sm shadow-md rounded-2xl p-6 border border-white/10 relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Club Settings</h2>
              <p className="text-xs text-gray-400 mt-0.5">Configure club information and branding</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-white/15 bg-gray-700/40 px-4 py-2 text-sm text-gray-200 transition hover:bg-gray-700/60 flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit
              </button>
            )}
          </div>

          {!isEditing ? (
            /* Read-only view */
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <ReadOnlyField label="Club Name" value={settings.clubName} />
                <ReadOnlyField label="Homepage Eyebrow" value={settings.homepageHeadline} />
                <ReadOnlyField label="Founded" value={settings.founded} />
                <ReadOnlyField label="League" value={settings.league} />
                <ReadOnlyField label="Ground" value={settings.ground} />
                <ReadOnlyField label="Contact Email" value={settings.contactEmail} />
                <ReadOnlyField label="Social Handle" value={settings.socialHandle} />
              </div>
              <ReadOnlyField label="Club Description" value={settings.clubDescription} />

              {settings.trophies?.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-300 mb-2">Trophy Cabinet</p>
                  <div className="space-y-4">
                    {settings.trophies.filter(t => t.competitionName || t.title).map((t, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-gray-700/20 p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-amber-300">🏆</span>
                          <span className="text-sm text-white font-bold">{t.competitionName || t.title}</span>
                          <span className="text-xs text-gray-400">{t.year}</span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div className="text-gray-400">Season: <span className="text-white">{t.seasonIdentifier || 'N/A'}</span></div>
                          <div className="text-gray-400">Manager: <span className="text-white">{t.manager || 'N/A'}</span></div>
                          <div className="text-gray-400">Captain: <span className="text-white">{t.captain || 'N/A'}</span></div>
                          <div className="text-gray-400">Final: <span className="text-white">{t.finalResult || 'N/A'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Edit form */
            <form onSubmit={handleUpdateClubSettings}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Club Name (3-100 characters)</label>
                  <input
                    type="text"
                    value={form.clubName}
                    onChange={(e) => updateField('clubName', e.target.value)}
                    className={`ui-field ${errors.clubName ? 'border-red-500' : ''}`}
                    placeholder="Enter club name"
                  />
                  {errors.clubName && <p className="text-red-400 text-sm mt-1">{errors.clubName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Homepage Eyebrow</label>
                  <input type="text" value={form.homepageHeadline} onChange={(e) => updateField('homepageHeadline', e.target.value)} className="ui-field" placeholder="Season in Motion" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Founded</label>
                  <input type="number" value={form.founded} onChange={(e) => updateField('founded', e.target.value)} className={`ui-field ${errors.founded ? 'border-red-500' : ''}`} placeholder="1987" />
                  {errors.founded && <p className="text-red-400 text-sm mt-1">{errors.founded}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">League</label>
                  <input type="text" value={form.league} onChange={(e) => updateField('league', e.target.value)} className="ui-field" placeholder="Premier Division" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Ground</label>
                  <input type="text" value={form.ground} onChange={(e) => updateField('ground', e.target.value)} className="ui-field" placeholder="Club Stadium" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Contact Email</label>
                  <input type="email" value={form.contactEmail} onChange={(e) => updateField('contactEmail', e.target.value)} className="ui-field" placeholder="hello@club.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Social Handle</label>
                  <input type="text" value={form.socialHandle} onChange={(e) => updateField('socialHandle', e.target.value)} className="ui-field" placeholder="@clubofficial" />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">Club Description</label>
                <textarea value={form.clubDescription} onChange={(e) => updateField('clubDescription', e.target.value)} className="ui-textarea" rows={3} placeholder="Describe the club story and identity" />
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-300">Trophy Cabinet</label>
                  <button type="button" onClick={handleAddTrophy} className="rounded-xl bg-amber-900/40 px-3 py-1 text-sm text-amber-200 hover:bg-amber-900/60 border border-amber-500/30">Add Trophy</button>
                </div>
                <div className="space-y-6">
                  {form.trophies.map((entry, index) => (
                    <div key={`trophy-${index}`} className="rounded-xl border border-white/10 bg-gray-800/60 p-4 relative">
                      <button type="button" onClick={() => handleRemoveTrophy(index)} className="absolute top-4 right-4 text-xs text-red-500 hover:text-red-400">Remove</button>
                      
                      <div className="grid gap-3 md:grid-cols-2 mb-3">
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Competition / Title</label>
                          <input type="text" value={entry.competitionName || entry.title || ''} onChange={(e) => updateTrophy(index, 'competitionName', e.target.value)} className="ui-field" placeholder="Premier League" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Season / Year</label>
                          <input type="text" value={entry.year} onChange={(e) => updateTrophy(index, 'year', e.target.value)} className="ui-field" placeholder="2026" />
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-2 mb-3">
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Season Name</label>
                          <input type="text" value={entry.seasonIdentifier} onChange={(e) => updateTrophy(index, 'seasonIdentifier', e.target.value)} className="ui-field" placeholder="SEASON 2025/26" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Manager</label>
                          <input type="text" value={entry.manager} onChange={(e) => updateTrophy(index, 'manager', e.target.value)} className="ui-field" placeholder="J. Guardiola" />
                        </div>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Captain</label>
                          <input type="text" value={entry.captain} onChange={(e) => updateTrophy(index, 'captain', e.target.value)} className="ui-field" placeholder="K. De Bruyne" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-gray-400 mb-1">Final Result</label>
                          <input type="text" value={entry.finalResult} onChange={(e) => updateTrophy(index, 'finalResult', e.target.value)} className="ui-field" placeholder="3-1 vs Man City" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.trophies && <p className="text-red-400 text-sm mt-2">{errors.trophies}</p>}
              </div>

              <div className="mt-6 flex gap-3">
                <button type="submit" disabled={saving} className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); fetchSettings(); }} className="px-5 py-2 rounded-xl border border-white/20 text-gray-300 hover:bg-gray-800/60 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column - Logo & Quick Info */}
        <div className="space-y-4">
          {/* Current Logo Preview */}
          <div className="bg-gray-800/40 backdrop-blur-sm shadow-md rounded-2xl p-6 border border-white/10 text-center">
            <h3 className="text-base font-semibold mb-4 text-white">Club Logo</h3>
            {logoSrc && !logoPreview && (
              <div className="mb-4 flex justify-center">
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'rgba(200,16,46,0.12)', border: '2px solid rgba(200,16,46,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', padding: 8,
                  boxShadow: '0 0 30px rgba(200,16,46,0.2)',
                }}>
                  <img src={logoSrc} alt="Club Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
              </div>
            )}

            {logoPreview && (
              <div className="mb-4 flex justify-center">
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'rgba(200,16,46,0.12)', border: '2px solid rgba(34,197,94,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', padding: 8,
                }}>
                  <img src={logoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
              </div>
            )}

            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center ${
                dragActive ? 'border-red-500 bg-red-900/20' : 'border-white/20'
              } ${errors.logo ? 'border-red-500' : ''}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs text-gray-300 mb-1">Drop logo here, or</p>
              <label className="cursor-pointer text-red-400 hover:text-red-300 text-xs">
                <span>browse files</span>
                <input type="file" className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} />
              </label>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, or WebP, max 5MB</p>
            </div>

            {errors.logo && <p className="text-red-400 text-sm mt-2">{errors.logo}</p>}

            {logoFile && (
              <div className="mt-3 flex gap-2 justify-center">
                <button onClick={handleUploadLogo} disabled={uploading} className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50 text-sm">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
                <button onClick={() => { setLogoFile(null); setLogoPreview(null); setErrors({}); }} className="bg-gray-700/40 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-700/60 border border-white/10 text-sm">
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-800/40 backdrop-blur-sm shadow-md rounded-2xl p-6 border border-white/10">
            <h3 className="text-base font-semibold mb-3 text-white">Quick Info</h3>
            <div className="space-y-3">
              <QuickInfoRow label="Club" value={settings.clubName || 'Not set'} />
              <QuickInfoRow label="Founded" value={settings.founded || 'N/A'} />
              <QuickInfoRow label="League" value={settings.league || 'N/A'} />
              <QuickInfoRow label="Ground" value={settings.ground || 'N/A'} />
              <QuickInfoRow label="Trophies" value={settings.trophies?.filter(t => t.competitionName || t.title).length || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">{label}</p>
    <p className="text-sm text-white">{value || <span className="text-gray-500 italic">Not set</span>}</p>
  </div>
);

const QuickInfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-medium text-white">{value}</span>
  </div>
);

export default ClubSettings;
