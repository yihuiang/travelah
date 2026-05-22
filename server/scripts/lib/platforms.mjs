/**
 * Platform registry — MediaCrawler code → display label + icon for the website.
 * Add a new entry when you import another social platform.
 */
export const PLATFORMS = {
  xhs: {
    id: 'xhs',
    name: 'RedNote',
    label: 'VIA REDNOTE',
    icon: 'database',
    dataFile: 'xhs.json',
  },
  dy: {
    id: 'dy',
    name: 'TikTok',
    label: 'VIA TIKTOK',
    icon: 'music_note',
    dataFile: 'dy.json',
  },
  wb: {
    id: 'wb',
    name: 'Weibo',
    label: 'VIA WEIBO',
    icon: 'public',
    dataFile: 'wb.json',
  },
  ig: {
    id: 'ig',
    name: 'Instagram',
    label: 'VIA INSTAGRAM',
    icon: 'photo_camera',
    dataFile: 'ig.json',
  },
}

export function getPlatformMeta(platformId) {
  return PLATFORMS[platformId] ?? {
    id: platformId,
    name: platformId,
    label: `VIA ${String(platformId).toUpperCase()}`,
    icon: 'share',
    dataFile: `${platformId}.json`,
  }
}

export function withSourceDisplay(post) {
  const meta = getPlatformMeta(post.platform)
  return {
    ...post,
    platformName: meta.name,
    sourceLabel: meta.label,
    sourceIcon: meta.icon,
  }
}
