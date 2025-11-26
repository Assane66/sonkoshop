import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Split URL to insert transformations
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id
  // We want: https://res.cloudinary.com/cloud_name/image/upload/f_auto,q_auto,w_{width}/v1234567890/public_id

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  let transformations = 'f_auto,q_auto';
  if (width) {
    transformations += `,w_${width}`;
  }

  // Check if there are already transformations in the second part (starts with v... or just path)
  // Usually transformations are after /upload/ and before /v...
  // But if the URL is raw from DB it might not have them.
  // We'll just inject ours after /upload/

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}
