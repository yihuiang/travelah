/** Shared border, input, and control styles for login + register modals */

export const authInputClass =
  'w-full px-6 py-4 rounded-full border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-on-surface-variant/40 font-body-md text-on-surface outline-none'

export const authLabelClass = 'block font-label-caps text-label-caps text-on-surface mb-2'

export const authCheckboxClass =
  'w-5 h-5 shrink-0 rounded border border-outline-variant text-primary focus:ring-2 focus:ring-primary focus:ring-offset-background bg-surface-container-lowest'

export const authSocialBtnClass =
  'flex items-center justify-center gap-3 border border-outline-variant rounded-full font-body-md text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed'

export const authSocialBtnFullClass = `${authSocialBtnClass} w-full py-3.5`

export const authSocialBtnGridClass = `${authSocialBtnClass} py-3 px-4`

export const authPrimaryBtnClass =
  'w-full py-4 rounded-full bg-primary text-on-primary font-body-lg text-body-lg font-bold shadow-md hover:bg-primary-container hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-60 disabled:hover:scale-100'

export const authDividerLineClass = 'border-t border-outline-variant'
