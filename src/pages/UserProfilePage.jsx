import { useEffect, useMemo, useState } from 'react'

const panelClassName =
  'rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm'

const roleOptions = ['Owner', 'Admin', 'Cashier', 'Technician']
const languageOptions = ['English', 'Sinhala', 'Tamil']
const themeOptions = ['Light', 'Dark']
const currencyOptions = ['LKR', 'USD', 'INR']
const dateFormatOptions = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']

const createId = (prefix) => `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`

const nowLabel = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${mm}`
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-(--color-border) px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-(--color-main-text)">{label}</p>
        {description ? (
          <p className="text-xs text-(--color-muted-text)">{description}</p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-(--color-main-text)">{title}</h3>
      <p className="mt-1 text-sm text-(--color-muted-text)">{description}</p>
    </div>
  )
}

function UserProfilePage() {
  const [profile, setProfile] = useState({
    firstName: 'Sasindu',
    lastName: 'Ariyadasa',
    phone: '0771234567',
    email: 'owner@mobileshop.lk',
    address: 'No. 24, Main Street, Colombo 12',
    dateOfBirth: '1995-06-14',
    username: 'sasindu_owner',
    role: 'Owner',
    accountStatus: 'Active',
    profilePhotoName: '',
  })

  const [photoPreview, setPhotoPreview] = useState('')

  const [accountInfo] = useState({
    createdAt: '2025-01-06',
    lastLogin: '2026-03-12 09:31',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [pinForm, setPinForm] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeoutMinutes: 30,
    requirePinOnLogin: true,
  })

  const [notifications, setNotifications] = useState({
    repairNotifications: true,
    salesAlerts: true,
    lowStockAlerts: true,
    warrantyExpirationAlerts: true,
  })

  const [preferences, setPreferences] = useState({
    language: 'English',
    theme: 'Light',
    currency: 'LKR',
    dateFormat: 'YYYY-MM-DD',
  })

  const [docUpload, setDocUpload] = useState({
    type: 'Identification',
    fileName: '',
  })

  const [documents, setDocuments] = useState([
    {
      id: 'DOC-2001',
      type: 'Identification',
      fileName: 'national-id-front.jpg',
      uploadedAt: '2026-02-14 10:28',
    },
    {
      id: 'DOC-2002',
      type: 'Business Document',
      fileName: 'business-registration.pdf',
      uploadedAt: '2026-01-07 15:40',
    },
    {
      id: 'DOC-2003',
      type: 'Verification',
      fileName: 'address-proof.pdf',
      uploadedAt: '2026-01-07 15:44',
    },
  ])

  const [activityLogs, setActivityLogs] = useState([
    {
      id: 'LOG-301',
      loginAt: '2026-03-12 09:31',
      action: 'Logged in to POS dashboard',
      device: 'Chrome on macOS',
      location: 'Colombo, Sri Lanka',
    },
    {
      id: 'LOG-302',
      loginAt: '2026-03-11 18:02',
      action: 'Updated inventory settings',
      device: 'Chrome on Windows',
      location: 'Colombo, Sri Lanka',
    },
    {
      id: 'LOG-303',
      loginAt: '2026-03-11 10:22',
      action: 'Approved supplier payment',
      device: 'Mobile Safari on iPhone',
      location: 'Kandy, Sri Lanka',
    },
    {
      id: 'LOG-304',
      loginAt: '2026-03-10 21:14',
      action: 'Changed account password',
      device: 'Chrome on macOS',
      location: 'Colombo, Sri Lanka',
    },
  ])

  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) return undefined

    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(
    () => () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview)
      }
    },
    [photoPreview],
  )

  const fullName = useMemo(
    () => `${profile.firstName} ${profile.lastName}`.trim(),
    [profile.firstName, profile.lastName],
  )

  const profileInitials = useMemo(() => {
    const first = profile.firstName.trim()[0] || ''
    const last = profile.lastName.trim()[0] || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }, [profile.firstName, profile.lastName])

  const addActivity = (action) => {
    setActivityLogs((prev) => [
      {
        id: createId('LOG'),
        loginAt: nowLabel(),
        action,
        device: 'Current Browser',
        location: 'Current Location',
      },
      ...prev,
    ].slice(0, 20))
  }

  const onPhotoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const nextUrl = URL.createObjectURL(file)
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview)
    }

    setPhotoPreview(nextUrl)
    setProfile((prev) => ({ ...prev, profilePhotoName: file.name }))
    setNotice('Profile photo selected.')
  }

  const onSavePersonalInfo = (event) => {
    event.preventDefault()
    setNotice('Personal information saved.')
    addActivity('Updated personal information')
  }

  const onUpdatePassword = (event) => {
    event.preventDefault()

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setNotice('Current and new password are required.')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setNotice('New password should be at least 8 characters.')
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice('New password and confirm password do not match.')
      return
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setNotice('Password updated successfully.')
    addActivity('Changed account password')
  }

  const onUpdatePin = (event) => {
    event.preventDefault()

    const pinRegex = /^\d{4,6}$/

    if (!pinRegex.test(pinForm.currentPin) || !pinRegex.test(pinForm.newPin)) {
      setNotice('PIN must be 4 to 6 digits.')
      return
    }

    if (pinForm.newPin !== pinForm.confirmPin) {
      setNotice('New PIN and confirm PIN do not match.')
      return
    }

    setPinForm({ currentPin: '', newPin: '', confirmPin: '' })
    setNotice('Login PIN updated.')
    addActivity('Updated POS login PIN')
  }

  const onUploadProfileDocument = (event) => {
    event.preventDefault()

    if (!docUpload.fileName) {
      setNotice('Select a document file to upload.')
      return
    }

    setDocuments((prev) => [
      {
        id: createId('DOC'),
        type: docUpload.type,
        fileName: docUpload.fileName,
        uploadedAt: nowLabel(),
      },
      ...prev,
    ])

    setDocUpload((prev) => ({ ...prev, fileName: '' }))
    setNotice('Profile document uploaded.')
    addActivity(`Uploaded ${docUpload.type} document`)
  }

  const onDocumentFileChange = (event) => {
    const file = event.target.files?.[0]
    setDocUpload((prev) => ({ ...prev, fileName: file ? file.name : '' }))
  }

  const onSavePreferences = (event) => {
    event.preventDefault()
    setNotice('Preferences saved.')
    addActivity('Updated language and preference settings')
  }

  const onSaveNotifications = (event) => {
    event.preventDefault()
    setNotice('Notification preferences saved.')
    addActivity('Updated notification preferences')
  }

  const onLogoutAllDevices = () => {
    const confirmed = window.confirm('Logout from all devices?')
    if (!confirmed) return

    setNotice('Logged out from all devices.')
    addActivity('Forced logout from all devices')
  }

  const onDeleteAccount = () => {
    const confirmed = window.confirm(
      'Delete account permanently? This action cannot be undone.',
    )

    if (!confirmed) return

    setNotice('Account deletion request submitted.')
    addActivity('Requested account deletion')
  }

  const canDeleteAccount = profile.role === 'Admin' || profile.role === 'Owner'

  return (
    <div className="space-y-6">
      <section className={`${panelClassName} flex flex-wrap items-start justify-between gap-4`}>
        <div>
          <h2 className="text-xl font-semibold text-(--color-main-text)">User Profile</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-(--color-muted-text)">
            Manage personal details, account security, preferences, profile documents,
            and account actions from a single page.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setNotice('Profile changes saved successfully.')
            addActivity('Saved profile changes')
          }}
          className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
        >
          Save Profile Changes
        </button>
      </section>

      {notice ? (
        <section className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
          {notice}
        </section>
      ) : null}

      <section className={`${panelClassName} flex flex-wrap items-center gap-4 sm:gap-6`}>
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-slate-100 text-2xl font-semibold text-slate-700">
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            profileInitials
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold text-(--color-main-text)">{fullName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700">
              {profile.role}
            </span>
            <span className="text-(--color-muted-text)">{profile.email}</span>
            <span className="text-(--color-muted-text)">•</span>
            <span className="text-(--color-muted-text)">{profile.phone}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-(--color-muted-text)">
            <span>@{profile.username}</span>
            <span>•</span>
            <span>Account Status: {profile.accountStatus}</span>
          </div>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-(--color-border) px-3 py-2 text-sm font-medium text-(--color-main-text)">
          Upload Photo
          <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
        </label>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Personal Information"
            description="Edit first/last name, contacts, address, profile photo, and birth date."
          />

          <form onSubmit={onSavePersonalInfo} className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              First Name
              <input
                type="text"
                value={profile.firstName}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, firstName: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Last Name
              <input
                type="text"
                value={profile.lastName}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, lastName: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Phone Number
              <input
                type="text"
                value={profile.phone}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Email Address
              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text) sm:col-span-2">
              Address
              <textarea
                rows={2}
                value={profile.address}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, address: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Date of Birth (optional)
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <div className="space-y-1 text-sm text-(--color-muted-text)">
              Profile Photo File
              <p className="rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)">
                {profile.profilePhotoName || 'No file selected'}
              </p>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
              >
                Save Personal Information
              </button>
            </div>
          </form>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Account Information"
            description="View username, role level, account creation date and last login."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Username</p>
              <p className="mt-1 text-sm font-medium text-(--color-main-text)">@{profile.username}</p>
            </div>
            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Role / Permission Level</p>
              <select
                value={profile.role}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, role: event.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-(--color-border) px-2 py-1.5 text-sm text-(--color-main-text)"
              >
                {roleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Account Creation Date</p>
              <p className="mt-1 text-sm font-medium text-(--color-main-text)">{accountInfo.createdAt}</p>
            </div>
            <div className="rounded-lg border border-(--color-border) p-3">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Last Login Time</p>
              <p className="mt-1 text-sm font-medium text-(--color-main-text)">{accountInfo.lastLogin}</p>
            </div>
            <div className="rounded-lg border border-(--color-border) p-3 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">Account Status</p>
              <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                {profile.accountStatus}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Password Management"
            description="Update current password and confirm new credentials."
          />

          <form onSubmit={onUpdatePassword} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Confirm New Password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Update Password
            </button>
          </form>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Login Security"
            description="Update POS login PIN, 2FA and session timeout security controls."
          />

          <form onSubmit={onUpdatePin} className="space-y-3">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Current PIN
              <input
                type="password"
                maxLength={6}
                value={pinForm.currentPin}
                onChange={(event) =>
                  setPinForm((prev) => ({ ...prev, currentPin: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              New PIN
              <input
                type="password"
                maxLength={6}
                value={pinForm.newPin}
                onChange={(event) =>
                  setPinForm((prev) => ({ ...prev, newPin: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Confirm New PIN
              <input
                type="password"
                maxLength={6}
                value={pinForm.confirmPin}
                onChange={(event) =>
                  setPinForm((prev) => ({ ...prev, confirmPin: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Change Login PIN
            </button>
          </form>

          <div className="space-y-2">
            <ToggleField
              label="Two-factor authentication"
              checked={security.twoFactorEnabled}
              onChange={(checked) =>
                setSecurity((prev) => ({ ...prev, twoFactorEnabled: checked }))
              }
            />
            <ToggleField
              label="Require login PIN"
              checked={security.requirePinOnLogin}
              onChange={(checked) =>
                setSecurity((prev) => ({ ...prev, requirePinOnLogin: checked }))
              }
            />

            <label className="block space-y-1 text-sm text-(--color-muted-text)">
              Session Timeout (minutes)
              <input
                type="number"
                min="5"
                value={security.sessionTimeoutMinutes}
                onChange={(event) =>
                  setSecurity((prev) => ({
                    ...prev,
                    sessionTimeoutMinutes: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              />
            </label>
          </div>
        </article>
      </section>

      <section className={`${panelClassName} space-y-4`}>
        <SectionTitle
          title="Activity Logs"
          description="Recent login history, actions, device information and location tracking."
        />

        <div className="hidden overflow-x-auto xl:block">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
              <tr>
                <th className="px-4 py-3">Recent Login</th>
                <th className="px-4 py-3">System Action</th>
                <th className="px-4 py-3">Device Used</th>
                <th className="px-4 py-3">Login Location</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} className="border-t border-(--color-border)">
                  <td className="px-4 py-3 text-(--color-muted-text)">{log.loginAt}</td>
                  <td className="px-4 py-3 text-(--color-main-text)">{log.action}</td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{log.device}</td>
                  <td className="px-4 py-3 text-(--color-muted-text)">{log.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 xl:hidden">
          {activityLogs.map((log) => (
            <article key={log.id} className="rounded-xl border border-(--color-border) p-4">
              <p className="text-xs text-(--color-muted-text)">{log.loginAt}</p>
              <p className="mt-1 font-medium text-(--color-main-text)">{log.action}</p>
              <p className="mt-1 text-sm text-(--color-muted-text)">{log.device}</p>
              <p className="mt-0.5 text-sm text-(--color-muted-text)">{log.location}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Notification Preferences"
            description="Control repair, sales, stock and warranty alerts."
          />

          <form onSubmit={onSaveNotifications} className="space-y-2">
            <ToggleField
              label="Repair notifications"
              checked={notifications.repairNotifications}
              onChange={(checked) =>
                setNotifications((prev) => ({ ...prev, repairNotifications: checked }))
              }
            />
            <ToggleField
              label="Sales alerts"
              checked={notifications.salesAlerts}
              onChange={(checked) =>
                setNotifications((prev) => ({ ...prev, salesAlerts: checked }))
              }
            />
            <ToggleField
              label="Low stock alerts"
              checked={notifications.lowStockAlerts}
              onChange={(checked) =>
                setNotifications((prev) => ({ ...prev, lowStockAlerts: checked }))
              }
            />
            <ToggleField
              label="Warranty expiration alerts"
              checked={notifications.warrantyExpirationAlerts}
              onChange={(checked) =>
                setNotifications((prev) => ({
                  ...prev,
                  warrantyExpirationAlerts: checked,
                }))
              }
            />

            <button
              type="submit"
              className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Notification Preferences
            </button>
          </form>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Language & Preferences"
            description="Set UI language, theme, currency and date format preferences."
          />

          <form onSubmit={onSavePreferences} className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Language
              <select
                value={preferences.language}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, language: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Theme
              <select
                value={preferences.theme}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, theme: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {themeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Currency Format
              <select
                value={preferences.currency}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, currency: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Date Format
              <select
                value={preferences.dateFormat}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, dateFormat: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                {dateFormatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Profile Documents"
            description="Upload identification, business and verification files."
          />

          <form onSubmit={onUploadProfileDocument} className="grid gap-3 sm:grid-cols-[180px,1fr,auto]">
            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Document Type
              <select
                value={docUpload.type}
                onChange={(event) =>
                  setDocUpload((prev) => ({ ...prev, type: event.target.value }))
                }
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-(--color-main-text)"
              >
                <option>Identification</option>
                <option>Business Document</option>
                <option>Verification</option>
              </select>
            </label>

            <label className="space-y-1 text-sm text-(--color-muted-text)">
              Select File
              <input
                type="file"
                onChange={onDocumentFileChange}
                className="w-full rounded-lg border border-(--color-border) px-3 py-2 text-sm text-(--color-main-text)"
              />
            </label>

            <button
              type="submit"
              className="self-end rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Upload
            </button>
          </form>

          <div className="overflow-x-auto rounded-xl border border-(--color-border)">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-(--color-muted-text)">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Uploaded At</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-t border-(--color-border)">
                    <td className="px-4 py-3 text-(--color-main-text)">{doc.type}</td>
                    <td className="px-4 py-3 text-(--color-main-text)">{doc.fileName}</td>
                    <td className="px-4 py-3 text-(--color-muted-text)">{doc.uploadedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${panelClassName} space-y-4`}>
          <SectionTitle
            title="Account Actions"
            description="Quick account controls including logout all sessions and account deletion."
          />

          <div className="space-y-3 rounded-xl border border-(--color-border) p-4">
            <button
              type="button"
              onClick={() => {
                setNotice('Profile changes saved.')
                addActivity('Saved profile changes from quick actions')
              }}
              className="w-full rounded-lg bg-(--color-accent) px-4 py-2 text-sm font-medium text-(--color-on-accent)"
            >
              Save Profile Changes
            </button>

            <button
              type="button"
              onClick={onLogoutAllDevices}
              className="w-full rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-main-text)"
            >
              Logout From All Devices
            </button>

            <button
              type="button"
              onClick={onDeleteAccount}
              disabled={!canDeleteAccount}
              className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${
                canDeleteAccount
                  ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                  : 'cursor-not-allowed border border-slate-200 text-slate-400'
              }`}
            >
              Delete Account (Admin only)
            </button>

            {!canDeleteAccount ? (
              <p className="text-xs text-(--color-muted-text)">
                You need admin-level access to delete account.
              </p>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  )
}

export default UserProfilePage
