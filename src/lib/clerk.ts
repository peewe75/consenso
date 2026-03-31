export const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full',
    card: 'w-full rounded-[32px] border border-white/10 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.12)]',
    headerTitle: 'text-2xl font-bold text-text-primary',
    headerSubtitle: 'text-sm text-text-secondary',
    socialButtonsBlockButton: 'rounded-2xl border border-border bg-white text-text-primary shadow-none',
    socialButtonsBlockButtonText: 'text-sm font-medium text-text-primary',
    dividerLine: 'bg-border',
    dividerText: 'text-text-muted',
    formFieldLabel: 'text-sm font-medium text-text-secondary',
    formFieldInput:
      'min-h-14 rounded-2xl border border-border bg-white px-4 text-base text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/10',
    formButtonPrimary:
      'min-h-14 rounded-full bg-accent text-base font-semibold text-white shadow-soft transition hover:bg-accent-hover',
    footerActionLink: 'font-semibold text-accent',
    identityPreviewText: 'text-text-secondary',
    formResendCodeLink: 'font-semibold text-accent',
    otpCodeFieldInput:
      'h-14 w-11 rounded-2xl border border-border bg-white text-text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/10',
    alert: 'rounded-2xl border border-danger/20 bg-danger/10 text-danger',
    alertText: 'text-sm text-danger',
  },
} as const
