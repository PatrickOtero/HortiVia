import { settingsSections } from '../data/settings';
import { SettingsSectionItem } from '../types/settings';

type GetSettingsSectionsOptions = {
  isAdmin?: boolean;
};

const adminSection: SettingsSectionItem = {
  id: 'admin',
  title: 'Administracao',
  rows: [
    {
      id: 'admin-content',
      label: 'Gerenciar conteudo',
      description: 'Produtos e artigos do HortiVia.',
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
