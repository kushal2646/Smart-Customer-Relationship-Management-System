import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { getErrorMessage, formatRole } from '../utils/helpers';
import { User, Lock, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, fetchUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', department: '' });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
      });
    }
  }, [user]);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-gray-500">Manage your account information</p>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user?.name}</h2>
            <p className="text-sm text-gray-500">{formatRole(user?.role)}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <h3 className="flex items-center gap-2 font-medium"><User className="h-4 w-4" /> Personal Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">Name</label><input className="input-field" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Email</label><input type="email" className="input-field" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Phone</label><input className="input-field" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
            <div><label className="mb-1 block text-sm font-medium">Department</label><input className="input-field" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} /></div>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary"><Save className="mr-2 h-4 w-4" />{savingProfile ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>

      <div className="card">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <h3 className="flex items-center gap-2 font-medium"><Lock className="h-4 w-4" /> Change Password</h3>
          <div><label className="mb-1 block text-sm font-medium">Current Password</label><input type="password" className="input-field" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-medium">New Password</label><input type="password" className="input-field" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required minLength={6} /></div>
            <div><label className="mb-1 block text-sm font-medium">Confirm Password</label><input type="password" className="input-field" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required /></div>
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
