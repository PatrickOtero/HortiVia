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
        label: 'Preferencias',
        description: 'Ajustes da sua experiencia no app.',
        type: 'info',
        actionKey: 'preferences',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferencias',
    rows: [
      {
        id: 'seasonal-tips',
        label: 'Dicas da estacao',
        description: 'Receba sugestoes sobre frutas, verduras e legumes da epoca.',
        type: 'toggle',
        preferenceKey: 'seasonalTipsEnabled',
      },
      {
        id: 'notifications',
        label: 'Notificacoes',
        description: 'Ative lembretes e novidades do HortiVia.',
        type: 'toggle',
        preferenceKey: 'notificationsEnabled',
      },
      {
        id: 'appearance',
        label: 'Aparencia',
        description: 'Ajuste o modo de visualizacao.',
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
        description: 'Tire duvidas sobre o uso do app.',
        type: 'info',
        actionKey: 'help',
      },
    ],
  },
  {
    id: 'session',
    title: 'Sessao',
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
