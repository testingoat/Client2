import Config from 'react-native-config';

const FALLBACK_R2_PUBLIC_BASE_URL =
  'https://pub-944071cb05354e0a88fc366c307eabe2.r2.dev';

export const R2_PUBLIC_BASE_URL =
  (Config.R2_PUBLIC_BASE_URL || FALLBACK_R2_PUBLIC_BASE_URL).replace(/\/+$/, '');

export const r2PublicUrl = (key: string) =>
  `${R2_PUBLIC_BASE_URL}/${key.replace(/^\/+/, '')}`;

