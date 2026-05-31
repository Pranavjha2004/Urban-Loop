import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";
import API from "../services/api";

function EditProfileModal({ user, onClose, onUpdated }) {

  const [name, setName] = useState(user.name || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [city, setCity] = useState(user.city || "");
  const [loading, setLoading] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user.avatar || "");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);


  const handleSave = async () => {
    try {

      setLoading(true);
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("city", city);

      if (avatar) formData.append("avatar", avatar);

      const res = await API.put("/users/me", formData, {
        onUploadProgress: (progressEvent) => {

          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setUploadProgress(percent);
        }
      });

      onUpdated(res.data);
      onClose();

    } catch (err) {
      console.log(err);
      alert("Profile update failed");

    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >

        <motion.div
          className="urban-surface rounded-[2rem] p-6 w-full max-w-md shadow-2xl"
          initial={{ scale: 0.94, y: 18 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.94, y: 18 }}
          onClick={(e) => e.stopPropagation()}
        >

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">Settings</p>
              <h2 className="text-xl font-black text-white mt-1">Edit Profile</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
              <X size={18} />
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 mb-5">

            <label className="relative cursor-pointer group">
              <img
                src={preview || "/default-avatar.png"}
                alt="avatar"
                className="w-28 h-28 rounded-[2rem] object-cover border border-white/10 shadow-lg"
              />
              <span className="absolute inset-0 rounded-[2rem] bg-black/45 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                <Camera size={24} />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setAvatar(file);
                  setPreview(URL.createObjectURL(file));
                }}
                className="hidden"
              />
            </label>

            <p className="text-xs font-semibold text-zinc-500">Click avatar to change photo</p>

          </div>

          {/* Upload Progress */}
          {isUploading && (
            <p className="text-purple-400 text-sm text-center mb-3">
              Uploading {uploadProgress}%
            </p>
          )}

          {/* Inputs */}
          <div className="space-y-3">

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full urban-input px-4 py-3 rounded-2xl text-sm"
            />

            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full urban-input px-4 py-3 rounded-2xl text-sm"
            />

            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full urban-input px-4 py-3 rounded-2xl text-sm"
            />

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Bio"
              rows={3}
              className="w-full urban-input px-4 py-3 rounded-2xl text-sm resize-none"
            />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-5">

            <button
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading}
              className="px-5 py-3 urban-pill rounded-2xl text-xs font-bold uppercase tracking-widest disabled:opacity-40"
            >
              {loading ? "Saving..." : "Save"}
            </button>

          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EditProfileModal;
