import { SettingsSectionItem } from '../types/settings';

export const settingsSections: SettingsSectionItem[] = [
  {
    id: 'account',
    title: 'Perfil',
    rows: [
      {
        id: 'profile',
        label: 'Meu perfil',
        description: 'Atualize nome, e-mail e foto.',
        type: 'navigation',
        actionKey: 'editProfile',
      },
      {
        id: 'general-preferences',
        label: 'Preferências',
        description: 'Escolha como prefere usar o HortiVia.',
        type: 'info',
        actionKey: 'preferences',
      },
      {
        id: 'saved-articles',
        label: 'Leituras salvas',
        description: 'Acesse artigos que você quer ler de novo depois.',
        type: 'navigation',
        actionKey: 'savedArticles',
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
        description: 'Receba sugestões ligadas aos alimentos da estação.',
        type: 'toggle',
        preferenceKey: 'seasonalTipsEnabled',
      },
      {
        id: 'notifications',
        label: 'Notificações',
        description: 'Receba avisos e novidades do app.',
        type: 'toggle',
        preferenceKey: 'notificationsEnabled',
      },
      {
        id: 'appearance',
        label: 'Aparência',
        description: 'Escolha o modo de visualização.',
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
        description: 'Entenda a proposta do HortiVia.',
        type: 'info',
        actionKey: 'about',
      },
      {
        id: 'help',
        label: 'Ajuda',
        description: 'Veja como aproveitar melhor o app.',
        type: 'info',
        actionKey: 'help',
      },
    ],
  },
  {
    id: 'session',
    title: 'Acesso',
    rows: [
      {
        id: 'sign-out',
        label: 'Sair',
        type: 'action',
        actionKey: 'signOut',
        tone: 'danger',
      },
    ],
  },
];
