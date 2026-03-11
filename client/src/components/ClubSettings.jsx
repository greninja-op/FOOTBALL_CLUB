import { useState, useEffect } from 'react';

const ClubSettings = () => {
  const [settings, setSettings] = useState({ clubName: '', logoUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [clubName, setClubName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

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
      setClubName(data.settings.clubName);
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
  const validateClubName = (name) => {
    if (name.length < 3 || name.length > 100) {
      return 'Club name must be between 3 and 100 characters';
    }
    return null;
  };

  // Handle club name update
  const handleUpdateClubName = async (e) => {
    e.preventDefault();
    
    const error = validateClubName(clubName);
    if (error) {
      setErrors({ clubName: error });
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clubName })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update club name');
      }

      const data = await response.json();
      setSettings(data.settings);
      showToast('Club name updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setErrors({ logo: 'Only JPEG and PNG files are allowed' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ logo: 'File size must be less than 5MB' });
      return;
    }

    setErrors({});
    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle logo upload
  const handleUploadLogo = async () => {
    if (!logoFile) return;

    setUploading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch(`${API_URL}/api/settings/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload logo');
      }

      const data = await response.json();
      setSettings(prev => ({ ...prev, logoUrl: data.logoUrl }));
      setLogoFile(null);
      setLogoPreview(null);
      showToast('Logo uploaded successfully');
      
      // Refresh settings to get updated logo
      fetchSettings();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading settings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Club Settings</h2>

      {/* Toast Notification */}
      {toast && (
        <div className={`mb-4 p-4 rounded ${
          toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Club Name Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Club Name</h3>
        <form onSubmit={handleUpdateClubName}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Club Name (3-100 characters)
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              className={`w-full border rounded px-3 py-2 ${
                errors.clubName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter club name"
            />
            {errors.clubName && (
              <p className="text-red-500 text-sm mt-1">{errors.clubName}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving || clubName === settings.clubName}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Club Name'}
          </button>
        </form>
      </div>

      {/* Logo Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Club Logo</h3>

        {/* Current Logo */}
        {settings.logoUrl && !logoPreview && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Current Logo:</p>
            <img
              src={`${API_URL}${settings.logoUrl}`}
              alt="Club Logo"
              className="max-w-xs h-auto border rounded"
            />
          </div>
        )}

        {/* Logo Preview */}
        {logoPreview && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Preview:</p>
            <img
              src={logoPreview}
              alt="Logo Preview"
              className="max-w-xs h-auto border rounded"
            />
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${errors.logo ? 'border-red-500' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your logo here, or
          </p>
          <label className="cursor-pointer text-blue-600 hover:text-blue-700">
            <span>browse files</span>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">
            JPEG or PNG, max 5MB
          </p>
        </div>

        {errors.logo && (
          <p className="text-red-500 text-sm mt-2">{errors.logo}</p>
        )}

        {/* Upload Button */}
        {logoFile && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleUploadLogo}
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Logo'}
            </button>
            <button
              onClick={() => {
                setLogoFile(null);
                setLogoPreview(null);
                setErrors({});
              }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubSettings;
