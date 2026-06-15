import { useEffect, useRef, useState } from 'react'
import PasswordField from './PasswordField.jsx'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const fieldClass =
  'w-full bg-surface-container-low border border-outline-variant rounded-full px-6 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface font-body-md disabled:opacity-60'

const labelClass = 'font-label-caps text-on-surface-variant uppercase'

export default function ProfileEditView({
  profile,
  onSavePersonal,
  onSavePassword,
  onUploadAvatar,
  onRemoveAvatar,
  personalSubmitting,
  passwordSubmitting,
  avatarUploading,
  personalError,
  passwordError,
  avatarError,
}) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null)
  const [avatarPickError, setAvatarPickError] = useState(null)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName || '')
    setEmail(profile.email || '')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setAvatarPreview(profile.avatarUrl || null)
    setPendingAvatarFile(null)
    setAvatarPickError(null)
    setPasswordOpen(false)
  }, [profile])

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview)
      }
    }
  }, [avatarPreview])

  if (!profile) return null

  const initial = (displayName || profile.username || '?').charAt(0).toUpperCase()
  const busy = personalSubmitting || passwordSubmitting || avatarUploading
  const hasPendingPhoto = Boolean(pendingAvatarFile)

  function handleAvatarPick(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    setAvatarPickError(null)

    if (!file) return

    if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
      setAvatarPickError('Please choose a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarPickError('Image must be 2 MB or smaller.')
      return
    }

    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    setPendingAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function cancelPendingPhoto() {
    if (avatarPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }
    setPendingAvatarFile(null)
    setAvatarPickError(null)
    setAvatarPreview(profile.avatarUrl || null)
  }

  async function confirmPendingPhoto() {
    if (!pendingAvatarFile || !onUploadAvatar) return
    setAvatarPickError(null)
    try {
      await onUploadAvatar(pendingAvatarFile)
      setPendingAvatarFile(null)
    } catch {
      // Parent sets avatarError; keep preview so user can retry.
    }
  }

  function handleSavePersonalClick(event) {
    event.preventDefault()
    onSavePersonal({
      displayName: displayName.trim(),
      email: email.trim(),
    })
  }

  function handleSavePasswordClick(event) {
    event.preventDefault()
    if (newPassword && newPassword !== confirmPassword) {
      onSavePassword({ validationError: 'New passwords do not match' })
      return
    }
    onSavePassword({
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12">
      <aside className="w-full md:w-1/4 flex flex-col gap-8">
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_20px_rgba(44,44,44,0.05)] border border-outline-variant/30 text-center">
          <div className="relative w-32 h-32 mx-auto mb-6">
            {avatarPreview ? (
              <img
                alt={displayName || profile.displayName}
                className={`w-full h-full object-cover rounded-full border-4 ${
                  hasPendingPhoto ? 'border-secondary-container' : 'border-surface-variant'
                }`}
                src={avatarPreview}
              />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-surface-variant bg-surface-container flex items-center justify-center text-primary font-headline-lg">
                {initial}
              </div>
            )}
            {hasPendingPhoto && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-secondary-container text-on-primary text-[10px] font-label-caps uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                Preview
              </span>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
              aria-label="Change profile photo"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept={AVATAR_ACCEPT}
              className="hidden"
              onChange={handleAvatarPick}
            />
          </div>

          {hasPendingPhoto && (
            <>
              <p className="font-body-md text-sm text-on-surface-variant mb-4">Happy with this photo?</p>
              <div className="flex flex-col gap-2 mb-4">
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={confirmPendingPhoto}
                  className="w-full bg-primary text-on-primary px-6 py-2.5 rounded-full font-label-caps hover:bg-primary-container transition-colors disabled:opacity-60"
                >
                  {avatarUploading ? 'Saving…' : 'Done'}
                </button>
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={cancelPendingPhoto}
                  className="w-full px-6 py-2.5 rounded-full border border-outline-variant text-on-surface-variant hover:text-primary transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {(avatarPickError || avatarError) && (
            <p className="mb-4 text-error font-body-md text-sm bg-error-container/30 rounded-full py-2 px-4">
              {avatarPickError || avatarError}
            </p>
          )}

          <h2 className="font-headline-md text-headline-md text-on-surface">{displayName || profile.displayName}</h2>
          <p className="font-body-md text-on-surface-variant mb-6 mt-1">{email || profile.email || 'No email set'}</p>
          {(avatarPreview || profile.avatarUrl) && !hasPendingPhoto && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (!onRemoveAvatar) return
                setAvatarPickError(null)
                try {
                  await onRemoveAvatar()
                  if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview)
                  setPendingAvatarFile(null)
                  setAvatarPreview(null)
                } catch {
                  // Parent sets avatarError
                }
              }}
              className="font-body-md text-sm text-on-surface-variant hover:text-error transition-colors disabled:opacity-60"
            >
              Remove photo
            </button>
          )}
        </div>
        <div className="hidden md:block opacity-10 mt-4 px-8 pointer-events-none">
          <span className="material-symbols-outlined text-[120px]">local_florist</span>
        </div>
      </aside>

      <section className="w-full md:w-3/4 flex flex-col gap-8 md:gap-12">
        <form
          onSubmit={handleSavePersonalClick}
          className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0px_4px_20px_rgba(44,44,44,0.05)] border border-outline-variant/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-5 -mr-8 -mt-8 pointer-events-none">
            <span className="material-symbols-outlined text-[180px]">fluid_med</span>
          </div>
          <h3 className="font-headline-lg text-3xl md:text-4xl text-primary mb-8 relative z-10">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className={labelClass} htmlFor="edit-full-name">
                Full name
              </label>
              <input
                id="edit-full-name"
                className={fieldClass}
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={80}
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className={labelClass} htmlFor="edit-email">
                Email
              </label>
              <input
                id="edit-email"
                className={fieldClass}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
            </div>
          </div>
          {personalError && (
            <p className="mt-6 text-error font-body-md text-sm bg-error-container/30 rounded-full py-2 px-4 text-center relative z-10">
              {personalError}
            </p>
          )}
          <div className="mt-10 flex justify-end relative z-10">
            <button
              type="submit"
              disabled={personalSubmitting}
              className="bg-primary text-on-primary px-10 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
            >
              {personalSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0px_4px_20px_rgba(44,44,44,0.05)] border border-outline-variant/20">
          <h3 className="font-headline-lg text-3xl md:text-4xl text-primary mb-8">Security</h3>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between py-4 border-b border-outline-variant/20 gap-4">
              <div>
                <p className="font-body-lg font-bold">Password</p>
                <p className="text-on-surface-variant text-sm">Update your account password</p>
              </div>
              {!passwordOpen && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setPasswordOpen(true)}
                  className="text-primary font-medium hover:underline shrink-0"
                >
                  Change Password
                </button>
              )}
            </div>
            {passwordOpen && (
              <form onSubmit={handleSavePasswordClick} className="space-y-4 pt-2">
                <PasswordField
                  id="edit-current-password"
                  label="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={passwordSubmitting}
                  autoComplete="current-password"
                />
                <PasswordField
                  id="edit-new-password"
                  label="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordSubmitting}
                  autoComplete="new-password"
                  minLength={8}
                />
                <PasswordField
                  id="edit-confirm-password"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordSubmitting}
                  autoComplete="new-password"
                />
                {passwordError && (
                  <p className="text-error font-body-md text-sm bg-error-container/30 rounded-full py-2 px-4 text-center">
                    {passwordError}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 justify-end pt-2">
                  <button
                    type="button"
                    disabled={passwordSubmitting}
                    onClick={() => {
                      setPasswordOpen(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                    className="px-6 py-2.5 rounded-full border border-outline-variant text-on-surface-variant hover:text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
                  >
                    {passwordSubmitting ? 'Updating…' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
