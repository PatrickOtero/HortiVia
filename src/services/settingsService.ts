import { settingsSections } from '../data/settings';
import { SettingsSectionItem } from '../types/settings';

type GetSettingsSectionsOptions = {
  isAdmin?: boolean;
};

const adminSection: SettingsSectionItem = {
  id: 'admin',
  title: 'Conteúdo',
  rows: [
    {
      id: 'admin-content',
      label: 'Gerenciar conteúdo',
      description: 'Produtos e artigos exibidos no app.',
      type: 'navigation',
      actionKey: 'adminContent',
    },
  ],
};

export function getSettingsSections(
  options: GetSettingsSectionsOptions = {},
): SettingsSectionItem[] {
  const sections = options.isAdmin
    ? [...settingsSections.slice(0, 2), adminSection, ...settingsSections.slice(2)]
    : settingsSections;

  return sections.map(section => ({
    ...section,
    rows: section.rows.map(row => ({
      ...row,
    })),
  }));
}
