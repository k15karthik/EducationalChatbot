// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  HelpCircle,
  Sparkles,
  User,
  Mail,
  Clock,
  Globe,
  Edit,
  Download,
  X,
  Save,
  ArrowLeft,
  Phone,
  Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddEmailModalOpen, setIsAddEmailModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // User data state - will be populated from backend
  const [userData, setUserData] = useState({
    username: "",
    fullName: "",
    displayName: "",
    sortableName: "",
    pronouns: "None",
    emails: [] as Array<{ id: number; email: string; isPrimary: boolean }>,
    contacts: [] as Array<{ id: number; type: string; value: string }>,
    language: "System Default (English (United States))",
    timeZone: "Central Time (US & Canada)",
  });

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:8000/users/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        
        // Map backend data to frontend state
        setUserData({
          username: data.username,
          fullName: data.full_name || data.username,
          displayName: data.full_name || data.username,
          sortableName: data.full_name || data.username,
          pronouns: "None",
          emails: data.email ? [{ id: 1, email: data.email, isPrimary: true }] : [],
          contacts: [],
          language: "System Default (English (United States))",
          timeZone: "Central Time (US & Canada)",
        });
        
        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const addEmail = (email: string) => {
    const newEmail = {
      id: Date.now(),
      email,
      isPrimary: false
    };
    setUserData(prev => ({
      ...prev,
      emails: [...prev.emails, newEmail]
    }));
  };

  const removeEmail = (id: number) => {
    setUserData(prev => ({
      ...prev,
      emails: prev.emails.filter(e => e.id !== id)
    }));
  };

  const setPrimaryEmail = (id: number) => {
    setUserData(prev => ({
      ...prev,
      emails: prev.emails.map(e => ({
        ...e,
        isPrimary: e.id === id
      }))
    }));
  };

  const addContact = (type: string, value: string) => {
    const newContact = {
      id: Date.now(),
      type,
      value
    };
    setUserData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const removeContact = (id: number) => {
    setUserData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B6B8C] mx-auto mb-4"></div>
          <p className="text-[#5C5C5C]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-[#3B6B8C] text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1F1F1F]">
      <TopBar username={userData.username} />
      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-[#3B6B8C] hover:text-[#2F5570] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          {/* Profile Header */}
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-[#E8E8E8] flex items-center justify-center">
                <User className="w-10 h-10 text-[#5C5C5C]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{userData.username}'s Settings</h1>
                <p className="text-sm text-[#5C5C5C] mt-1">Manage your profile and preferences</p>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="space-y-4">
              <ProfileRow 
                label="Username"
                value={userData.username}
                description="Your unique username for login."
              />
              
              <ProfileRow 
                label="Full Name"
                value={userData.fullName}
                description="This name will be used for grading."
              />
              
              <ProfileRow 
                label="Display Name"
                value={userData.displayName}
                description="People will see this name in discussions, messages and comments."
              />
              
              <ProfileRow 
                label="Sortable Name"
                value={userData.sortableName}
                description="This name appears in sorted lists."
              />
              
              <ProfileRow 
                label="Pronouns"
                value={userData.pronouns}
                description="This pronoun will appear after your name when enabled"
              />
              
              <ProfileRow 
                label="Language"
                value={userData.language}
                icon={<Globe className="w-4 h-4 text-[#5C5C5C]" />}
              />
              
              <ProfileRow 
                label="Time Zone"
                value={userData.timeZone}
                icon={<Clock className="w-4 h-4 text-[#5C5C5C]" />}
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
            <h2 className="text-lg font-semibold mb-4">Ways to Contact</h2>
            
            <div className="space-y-6">
              {/* Email Addresses */}
              <div>
                <h3 className="text-md font-semibold mb-3">Email Addresses</h3>
                {userData.emails.length > 0 ? (
                  <div className="space-y-2">
                    {userData.emails.map((emailObj) => (
                      <div 
                        key={emailObj.id}
                        className="flex items-center justify-between p-3 rounded bg-[#F5F5F5] border border-[#E8E8E8]"
                      >
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-[#5C5C5C]" />
                          <span className="text-sm">{emailObj.email}</span>
                          {emailObj.isPrimary && (
                            <span className="text-[#3B6B8C]">★</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {!emailObj.isPrimary && (
                            <>
                              <button
                                onClick={() => setPrimaryEmail(emailObj.id)}
                                className="text-xs text-[#3B6B8C] hover:text-[#2F5570] font-medium"
                              >
                                Make Primary
                              </button>
                              <button
                                onClick={() => removeEmail(emailObj.id)}
                                className="p-1 hover:bg-[#FEF2F2] rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-[#DC2626]" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#5C5C5C]">No email addresses added yet.</p>
                )}
                <button 
                  onClick={() => setIsAddEmailModalOpen(true)}
                  className="mt-2 text-sm text-[#3B6B8C] hover:text-[#2F5570] font-medium"
                >
                  + Email Address
                </button>
              </div>

              {/* Other Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold">Other Contacts</h3>
                  <span className="text-sm text-[#5C5C5C]">Type</span>
                </div>
                {userData.contacts.length > 0 ? (
                  <div className="space-y-2 mb-2">
                    {userData.contacts.map((contact) => (
                      <div 
                        key={contact.id}
                        className="flex items-center justify-between p-3 rounded bg-[#F5F5F5] border border-[#E8E8E8]"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <Phone className="w-4 h-4 text-[#5C5C5C]" />
                          <span className="text-sm">{contact.value}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-[#5C5C5C] font-medium">{contact.type}</span>
                          <button
                            onClick={() => removeContact(contact.id)}
                            className="p-1 hover:bg-[#FEF2F2] rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-[#DC2626]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#5C5C5C] mb-2">No contact methods added yet.</p>
                )}
                <button 
                  onClick={() => setIsAddContactModalOpen(true)}
                  className="text-sm text-[#3B6B8C] hover:text-[#2F5570] font-medium"
                >
                  + Contact Method
                </button>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className="rounded-lg bg-[#FEFDFB] border border-[#E8E8E8] p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-medium bg-[#3B6B8C] hover:bg-[#2F5570] text-white transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Settings</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg font-medium bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1F1F1F] transition-colors border border-[#E8E8E8]">
                <Download className="w-4 h-4" />
                <span>Download Submissions</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Edit Settings Modal */}
      {isEditModalOpen && (
        <EditSettingsModal 
          userData={userData}
          setUserData={setUserData}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Add Email Modal */}
      {isAddEmailModalOpen && (
        <AddEmailModal
          onAdd={addEmail}
          onClose={() => setIsAddEmailModalOpen(false)}
        />
      )}

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <AddContactModal
          onAdd={addContact}
          onClose={() => setIsAddContactModalOpen(false)}
        />
      )}
    </div>
  );
}

function TopBar({ username }: { username: string }) {
  return (
    <header className="bg-white border-b border-[#E8E8E8]">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#3B6B8C]" />
            <span className="font-semibold text-lg">EduChatbot</span>
          </Link>
          <span className="text-sm text-[#999999]">|</span>
          <span className="text-sm font-medium">Profile</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-[#5C5C5C]">
            <span className="font-medium text-[#1F1F1F]">{username}</span>
          </span>
          <button
            className="p-2 rounded hover:bg-[#F5F5F5] transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function ProfileRow({ 
  label, 
  value, 
  description,
  icon 
}: { 
  label: string; 
  value: string; 
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="py-3 border-b border-[#E8E8E8] last:border-b-0">
      <div className="flex items-start">
        <div className="w-40 flex-shrink-0">
          <label className="text-sm font-medium text-[#1F1F1F]">{label}:</label>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            {icon && icon}
            <span className="text-sm text-[#1F1F1F]">{value}</span>
          </div>
          {description && typeof description === 'string' ? (
            <p className="text-xs text-[#5C5C5C] mt-1">{description}</p>
          ) : (
            description
          )}
        </div>
      </div>
    </div>
  );
}

function EditSettingsModal({ 
  userData, 
  setUserData, 
  onClose 
}: { 
  userData: any; 
  setUserData: (data: any) => void; 
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(userData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch("http://localhost:8000/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.emails[0]?.email || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setUserData(formData);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-[#E8E8E8] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40"
              placeholder="Enter your full name"
            />
            <p className="text-xs text-[#5C5C5C] mt-1">This name will be used for grading.</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Display Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40"
              placeholder="Enter your display name"
            />
            <p className="text-xs text-[#5C5C5C] mt-1">
              People will see this name in discussions, messages and comments.
            </p>
          </div>

          {/* Sortable Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sortable Name
            </label>
            <input
              type="text"
              value={formData.sortableName}
              onChange={(e) => handleChange('sortableName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40"
              placeholder="Last, First Middle"
            />
            <p className="text-xs text-[#5C5C5C] mt-1">This name appears in sorted lists.</p>
          </div>

          {/* Pronouns */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Pronouns
            </label>
            <select
              value={formData.pronouns}
              onChange={(e) => handleChange('pronouns', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
            >
              <option value="None">None</option>
              <option value="He/Him">He/Him</option>
              <option value="She/Her">She/Her</option>
              <option value="They/Them">They/Them</option>
              <option value="Ze/Zir">Ze/Zir</option>
            </select>
            <p className="text-xs text-[#5C5C5C] mt-1">
              This pronoun will appear after your name when enabled.
            </p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Language
            </label>
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#5C5C5C]" />
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
              >
                <option value="System Default (English (United States))">System Default (English (United States))</option>
                <option value="English (United Kingdom)">English (United Kingdom)</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          {/* Time Zone */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Time Zone
            </label>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#5C5C5C]" />
              <select
                value={formData.timeZone}
                onChange={(e) => handleChange('timeZone', e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
              >
                <option value="Eastern Time (US & Canada)">Eastern Time (US & Canada)</option>
                <option value="Central Time (US & Canada)">Central Time (US & Canada)</option>
                <option value="Mountain Time (US & Canada)">Mountain Time (US & Canada)</option>
                <option value="Pacific Time (US & Canada)">Pacific Time (US & Canada)</option>
                <option value="Alaska">Alaska</option>
                <option value="Hawaii">Hawaii</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#F5F5F5] border-t border-[#E8E8E8] p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg font-medium bg-white hover:bg-[#F5F5F5] text-[#1F1F1F] transition-colors border border-[#E8E8E8] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg font-medium bg-[#3B6B8C] hover:bg-[#2F5570] text-white transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AddEmailModal({ 
  onAdd, 
  onClose 
}: { 
  onAdd: (email: string) => void; 
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");

  const handleAdd = () => {
    if (email.trim() && email.includes('@')) {
      onAdd(email.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-[#E8E8E8] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Email Address</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium mb-2">
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40"
            placeholder="example@email.com"
            autoFocus
          />
        </div>

        <div className="bg-[#F5F5F5] border-t border-[#E8E8E8] p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium bg-white hover:bg-[#F5F5F5] text-[#1F1F1F] transition-colors border border-[#E8E8E8]"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!email.trim() || !email.includes('@')}
            className="px-5 py-2.5 rounded-lg font-medium bg-[#3B6B8C] hover:bg-[#2F5570] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Email
          </button>
        </div>
      </div>
    </div>
  );
}

function AddContactModal({ 
  onAdd, 
  onClose 
}: { 
  onAdd: (type: string, value: string) => void; 
  onClose: () => void;
}) {
  const [contactType, setContactType] = useState("Mobile");
  const [contactValue, setContactValue] = useState("");

  const handleAdd = () => {
    if (contactValue.trim()) {
      onAdd(contactType, contactValue.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-[#E8E8E8] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Contact Method</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Contact Type <span className="text-red-600">*</span>
            </label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40 bg-white"
            >
              <option value="Mobile">Mobile</option>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#D4D4D4] focus:outline-none focus:ring-2 focus:ring-[#3B6B8C]/40"
              placeholder="(123) 456-7890"
            />
          </div>
        </div>

        <div className="bg-[#F5F5F5] border-t border-[#E8E8E8] p-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium bg-white hover:bg-[#F5F5F5] text-[#1F1F1F] transition-colors border border-[#E8E8E8]"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!contactValue.trim()}
            className="px-5 py-2.5 rounded-lg font-medium bg-[#3B6B8C] hover:bg-[#2F5570] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
}