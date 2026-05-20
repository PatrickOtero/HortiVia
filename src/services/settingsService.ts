import { settingsSections } from '../data/settings';
import { SettingsSectionItem } from '../types/settings';

export function getSettingsSections(): SettingsSectionItem[] {
  return settingsSections.map(section => ({
    ...section,
    rows: section.rows.map(row => ({
      ...row,
    })),
  }));
}
