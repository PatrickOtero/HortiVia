import { SettingsSectionItem } from '../types/settings';

export const settingsSections: SettingsSectionItem[] = [
  {
    id: 'account',
    title: 'Conta',
    rows: [
      {
        id: 'profile',
        label: 'Meu perfil',
        description: 'Nome, e-mail e dados da conta.',
        type: 'navigation',
        actionKey: 'editProfile',
      },
      {
        id: 'general-preferences',
        label: 'Preferências',
        description: 'Ajustes da sua experiência no app.',
        type: 'info',
        actionKey: 'preferences',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferências',
    rows: [
      {
        id: 'seasonal-tips',
        label: 'Dicas da estação',
        description: 'Receba sugestões sobre frutas, verduras e legumes da época.',
        type: 'toggle',
        preferenceKey: 'seasonalTipsEnabled',
      },
      {
        id: 'notifications',
        label: 'Notificações',
        description: 'Ative lembretes e novidades do HortiVia.',
        type: 'toggle',
        preferenceKey: 'notificationsEnabled',
      },
      {
        id: 'appearance',
        label: 'Aparência',
        description: 'Ajuste o modo de visualização.',
        type: 'theme',
        actionKey: 'appearance',
      },
    ],
  },
  {
    id: 'support',
    title: 'Suporte',
    rows: [
      {
        id: 'about',
        label: 'Sobre o HortiVia',
        description: 'Guia de frutas, verduras e legumes.',
        type: 'info',
        actionKey: 'about',
      },
      {
        id: 'help',
        label: 'Ajuda',
        description: 'Tire dúvidas sobre o uso do app.',
        type: 'info',
        actionKey: 'help',
      },
    ],
  },
  {
    id: 'session',
    title: 'Sessão',
    rows: [
      {
        id: 'sign-out',
        label: 'Sair da conta',
        type: 'action',
        actionKey: 'signOut',
        tone: 'danger',
      },
    ],
  },
];
