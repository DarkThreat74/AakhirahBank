export const COLORS = {
  background: '#0A0A08',
  surface: '#111109',
  surfaceElevated: '#1A1A14',
  primaryGold: '#C9A84C',
  goldLight: '#F0D080',
  goldDim: '#8B6914',
  textPrimary: '#F5F0E8',
  textSecondary: '#8A8070',
  danger: '#C0392B',
  success: '#2ECC71',
  border: 'rgba(201, 168, 76, 0.15)',
};

export const TYPOGRAPHY = {
  display: 'Cinzel',
  body: 'Inter',
};

export const COMMON_STYLES = {
  card: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  button: {
    backgroundColor: COLORS.primaryGold,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.body,
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
};
