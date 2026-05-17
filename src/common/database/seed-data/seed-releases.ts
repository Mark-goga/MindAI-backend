import { releases } from '@common/database/schema';
import type { SeedContext } from './seed-shared';

type ReleaseInsert = typeof releases.$inferInsert;

const SEED_RELEASES: ReleaseInsert[] = [
  // mindai.ios
  {
    appId: 'mindai.ios',
    platform: 'ios',
    version: '1.0.0',
    minVersion: '1.0.0',
    isMandatory: false,
    isReleased: true,
    storeUrl: 'https://apps.apple.com/app/mindai',
    releaseNotes: { en: 'Initial release', uk: 'Перший реліз' },
  },
  {
    appId: 'mindai.ios',
    platform: 'ios',
    version: '1.1.0',
    minVersion: '1.0.0',
    isMandatory: false,
    isReleased: true,
    storeUrl: 'https://apps.apple.com/app/mindai',
    releaseNotes: {
      en: 'Bug fixes and performance improvements',
      uk: 'Виправлення помилок та покращення продуктивності',
    },
  },
  {
    appId: 'mindai.ios',
    platform: 'ios',
    version: '2.0.0',
    minVersion: '2.0.0',
    isMandatory: true,
    isReleased: true,
    storeUrl: 'https://apps.apple.com/app/mindai',
    releaseNotes: {
      en: 'Major update with new features. Update required due to API changes.',
      uk: 'Великий апдейт з новими функціями. Оновлення обовʼязкове через зміни API.',
    },
  },
  {
    appId: 'mindai.ios',
    platform: 'ios',
    version: '2.1.0',
    minVersion: '2.0.0',
    isMandatory: false,
    isReleased: false,
    storeUrl: 'https://apps.apple.com/app/mindai',
    releaseNotes: { en: 'Upcoming release', uk: 'Наступний реліз' },
  },

  // mindai.android
  {
    appId: 'mindai.android',
    platform: 'android',
    version: '1.0.0',
    minVersion: '1.0.0',
    isMandatory: false,
    isReleased: true,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.mindai',
    releaseNotes: { en: 'Initial release', uk: 'Перший реліз' },
  },
  {
    appId: 'mindai.android',
    platform: 'android',
    version: '1.1.0',
    minVersion: '1.0.0',
    isMandatory: false,
    isReleased: true,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.mindai',
    releaseNotes: {
      en: 'Bug fixes and performance improvements',
      uk: 'Виправлення помилок та покращення продуктивності',
    },
  },
  {
    appId: 'mindai.android',
    platform: 'android',
    version: '2.0.0',
    minVersion: '2.0.0',
    isMandatory: true,
    isReleased: true,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.mindai',
    releaseNotes: {
      en: 'Major update with new features. Update required due to API changes.',
      uk: 'Великий апдейт з новими функціями. Оновлення обовʼязкове через зміни API.',
    },
  },
  {
    appId: 'mindai.android',
    platform: 'android',
    version: '2.1.0',
    minVersion: '2.0.0',
    isMandatory: false,
    isReleased: false,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.mindai',
    releaseNotes: { en: 'Upcoming release', uk: 'Наступний реліз' },
  },

  // mindai.desktop — Windows
  {
    appId: 'mindai.desktop',
    platform: 'desktop_win',
    version: '1.0.0',
    minVersion: '1.0.0',
    isMandatory: false,
    isReleased: true,
    downloadUrl: 'https://cdn.mindai.app/releases/mindai-1.0.0-win.exe',
    releaseNotes: { en: 'Initial release', uk: 'Перший реліз' },
  },
  {
    appId: 'mindai.desktop',
    platform: 'desktop_win',
    version: '2.0.0',
    minVersion: '2.0.0',
    isMandatory: true,
    isReleased: true,
    downloadUrl: 'https://cdn.mindai.app/releases/mindai-2.0.0-win.exe',
    releaseNotes: {
      en: 'Major update. Update required due to API changes.',
      uk: 'Великий апдейт. Оновлення обовʼязкове через зміни API.',
    },
  },

  // mindai.desktop — macOS
  {
    appId: 'mindai.desktop',
    platform: 'desktop_mac',
    version: '1.0.0',
    minVersion: '1.0.0',
    isMandatory: false,
    isReleased: true,
    downloadUrl: 'https://cdn.mindai.app/releases/mindai-1.0.0-mac.dmg',
    releaseNotes: { en: 'Initial release', uk: 'Перший реліз' },
  },
  {
    appId: 'mindai.desktop',
    platform: 'desktop_mac',
    version: '2.0.0',
    minVersion: '2.0.0',
    isMandatory: true,
    isReleased: true,
    downloadUrl: 'https://cdn.mindai.app/releases/mindai-2.0.0-mac.dmg',
    releaseNotes: {
      en: 'Major update. Update required due to API changes.',
      uk: 'Великий апдейт. Оновлення обовʼязкове через зміни API.',
    },
  },
];

export async function seedReleases(context: SeedContext): Promise<number> {
  console.log(`Seeding ${SEED_RELEASES.length} releases...`);

  await context.db.insert(releases).values(SEED_RELEASES).onConflictDoNothing();

  console.log(`Releases seeded.`);

  return SEED_RELEASES.length;
}
