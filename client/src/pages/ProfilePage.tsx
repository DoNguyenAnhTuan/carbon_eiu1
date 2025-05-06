import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const ProfilePage = () => {
  const [tab, setTab] = useState<'profile' | 'password'>('profile');
  // Profile info (static for admin)
  const profile = {
    name: 'admin',
    email: 'eiu@qenergy.ai',
    address: 'Binh Duong, Vietnam',
    telephone: '0161 706 0980',
  };
  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    const stored = localStorage.getItem("account");
    const account = stored ? JSON.parse(stored) : { username: "admin", password: "admin" };
    if (oldPassword !== account.password) {
      setError("Old password is incorrect.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (!newPassword) {
      setError("New password cannot be empty.");
      return;
    }
    // Update password in localStorage
    localStorage.setItem("account", JSON.stringify({ ...account, password: newPassword }));
    setMessage("Password changed successfully!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">
      <div className="flex items-center mb-8">
        <div className="flex gap-2 bg-gray-100 rounded-full p-1">
          <button
            className={`px-6 py-2 rounded-full font-semibold text-base ${tab === 'profile' ? 'bg-white text-[#0B3D61] shadow' : 'text-gray-500'}`}
            onClick={() => setTab('profile')}
          >
            Profile
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold text-base ${tab === 'password' ? 'bg-white text-[#0B3D61] shadow' : 'text-gray-500'}`}
            onClick={() => setTab('password')}
          >
            Password
          </button>
        </div>
        <div className="flex-1" />
        <Button variant="outline">User Management</Button>
      </div>
      {tab === 'profile' && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Energy Manager Name:</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border bg-gray-100 p-3 pr-10 text-gray-700 outline-none"
                value={profile.name}
                disabled
              />
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Email:</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border bg-gray-100 p-3 pr-10 text-gray-700 outline-none"
                value={profile.email}
                disabled
              />
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Address:</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border bg-gray-100 p-3 pr-10 text-gray-700 outline-none"
                value={profile.address}
                disabled
              />
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Telephone:</label>
            <div className="relative">
              <input
                className="w-full rounded-lg border bg-gray-100 p-3 pr-10 text-gray-700 outline-none"
                value={profile.telephone}
                disabled
              />
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="col-span-2 flex justify-center mt-4">
            <Button className="bg-gradient-to-r from-[#0B3D61] to-[#002855] px-10 py-2 text-lg text-white">SAVE</Button>
          </div>
        </form>
      )}
      {tab === 'password' && (
        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
          <div className="col-span-2 md:col-span-2">
            <label className="block mb-1 font-medium">Old Password: <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                className="w-full rounded-lg border p-3 pr-10 outline-none bg-white"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowOld(v => !v)}>
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">New Password: <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                className="w-full rounded-lg border p-3 pr-10 outline-none bg-white"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowNew(v => !v)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Password Confirm: <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-lg border p-3 pr-10 outline-none bg-white"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowConfirm(v => !v)}>
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-center mt-4">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
            <Button type="submit" className="bg-[#0B3D61] hover:bg-[#002855] px-10 py-2 text-lg text-white">SAVE</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage; 