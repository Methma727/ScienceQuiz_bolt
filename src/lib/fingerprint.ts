import type { BrowserInfo, LocationInfo } from './supabase';

function parseUserAgent(ua: string): { browser: string; os: string } {
  let browser = 'Unknown';
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && ua.includes('Version/')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return { browser, os };
}

function detectDevice(ua: string): string {
  if (ua.includes('iPhone') || ua.includes('Android') && ua.includes('Mobile')) return 'Mobile';
  if (ua.includes('iPad') || (ua.includes('Android') && !ua.includes('Mobile'))) return 'Tablet';
  return 'Desktop';
}

export async function collectBrowserInfo(): Promise<BrowserInfo> {
  const ua = navigator.userAgent;
  const { browser, os } = parseUserAgent(ua);

  return {
    userAgent: ua,
    browser,
    os,
    device: detectDevice(ua),
    screen: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || 'en',
    platform: navigator.platform || 'unknown',
  };
}

export async function fetchLocationInfo(): Promise<LocationInfo | null> {
  try {
    const res = await fetch('http://ip-api.com/json/?fields=query,country,regionName,city,timezone,isp');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'fail') return null;

    return {
      ip: data.query,
      country: data.country || '',
      region: data.regionName || '',
      city: data.city || '',
      timezone: data.timezone || '',
      isp: data.isp || '',
    };
  } catch {
    return null;
  }
}
