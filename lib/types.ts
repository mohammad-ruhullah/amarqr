export type ContentType = "url" | "text" | "email" | "phone" | "sms" | "wifi" | "vcard" | "location";

export type EyeStyle = "square" | "circle" | "rounded";

export type ErrorLevel = "L" | "M" | "Q" | "H";

export type ModuleStyle = "square" | "circle" | "diamond";

export type DownloadFormat = "png" | "svg" | "jpg";

export type LogoShape = "square" | "circle";

export interface QRConfig {
  content: string;
  contentType: ContentType;
  fgColor: string;
  bgColor: string;
  moduleStyle: ModuleStyle;
  eyeStyle: EyeStyle;
  eyeColor: string;
  size: number;
  errorLevel: ErrorLevel;
  logo: string | null;
  badgeColor: string;
  logoShape: LogoShape;
}

export interface Review {
  id: number;
  name: string;
  message: string;
  rating: number;
  created_at: string;
}

export interface SubReview {
  name: string;
  message: string;
  rating: number;
}
