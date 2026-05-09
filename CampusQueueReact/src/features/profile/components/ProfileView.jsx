import React, { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';

/**
 * Vertical Slice: Profile
 * Handles user profile display and editing.
 */
export const ProfileView = ({ onBack }) => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      setUser(user);
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setMessage({ text: '', type: '' });

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const newAvatarUrl = data.publicUrl;
      setAvatarUrl(newAvatarUrl);

      // Save avatar_url to user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: newAvatarUrl }
      });

      if (updateError) throw updateError;
      
      setMessage({ text: 'Avatar uploaded successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message || 'Error uploading avatar', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });

      const updates = {
        data: {
          full_name: fullName,
        }
      };

      if (password) {
        updates.password = password;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword(''); // Clear password field
    } catch (error) {
      setMessage({ text: error.message || 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading && !user) {
    return <div className="page active profile-theme"><div style={{padding: '50px', textAlign: 'center'}}>Loading...</div></div>;
  }

  return (
    <div className="page active profile-theme" style={{ display: 'block' }}>
      <nav className="navbar profile-nav">
        <div className="nav-logo">
          <div className="nav-ico-btn" onClick={onBack} style={{ background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            ←
          </div>
          <div>
            <div className="nav-title" style={{ color: '#111' }}>Campus Queue</div>
            <div className="nav-subtitle" style={{ color: '#666' }}>Profile</div>
          </div>
        </div>
      </nav>

      <div className="profile-body">
        <div className="profile-card" style={{ paddingBottom: '30px' }}>
          <div className="pc-header" style={{ flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div className="pc-avatar" style={{ width: '80px', height: '80px', fontSize: '32px' }}>
                {fullName ? fullName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : 'U')}
              </div>
            )}
            
            <div style={{ textAlign: 'center' }}>
              <label className="btn-edit-prof" style={{ cursor: 'pointer', display: 'inline-block' }}>
                {uploading ? 'Uploading...' : 'Change Picture'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={uploadAvatar} 
                  disabled={uploading}
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            
            <div className="pc-title" style={{ textAlign: 'center' }}>
              <div className="pc-name">{fullName || 'Student'}</div>
              {user?.user_metadata?.role === 'admin' && (
                <div style={{ background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', display: 'inline-block', marginTop: '5px' }}>Admin</div>
              )}
            </div>
          </div>

          <div style={{ padding: '0 20px' }}>
            {message.text && (
              <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px', background: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534', fontSize: '14px' }}>
                {message.text}
              </div>
            )}

            <div className="field" style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Email (Cannot be changed)</label>
              <div className="field-wrap" style={{ background: '#f3f4f6' }}>
                <input type="email" value={email} disabled style={{ background: 'transparent' }} />
              </div>
            </div>
            
            <div className="field" style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>Username / Full Name</label>
              <div className="field-wrap">
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#666' }}>New Password (leave blank to keep current)</label>
              <div className="field-wrap">
                <input 
                  type="password" 
                  value={password} 
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              className="btn-main btn-glow" 
              onClick={handleUpdateProfile} 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <button className="btn-signout" onClick={handleSignOut} style={{ marginTop: '20px' }}>Sign Out</button>
      </div>
    </div>
  );
};
