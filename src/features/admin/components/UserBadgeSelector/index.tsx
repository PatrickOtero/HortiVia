import React, { useEffect, useRef, useState } from 'react';
import { PrimaryButton, SectionTitle, UserBadge } from '../../../../components';
import { USER_BADGE_OPTIONS } from '../../../../components/UserBadge';
import type { UserBadgeType } from '../../../../types/userBadge';
import { useAuth } from '../../../auth/hooks/useAuth';
import { usersService } from '../../services/users.service';
import * as S from './styles';

type Props = {
  userId: string;
  badge: UserBadgeType | null;
  onSaved: () => void;
};

export function UserBadgeSelector({ userId, badge, onSaved }: Props) {
  const { user } = useAuth();
  const [selected, setSelected] = useState(badge);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  useEffect(() => {
    setSelected(badge);
    setError('');
  }, [badge, userId]);
  if (user?.role !== 'ADMIN') return null;

  async function save() {
    if (pending.current || selected === badge) return;
    pending.current = true;
    setSaving(true);
    setError('');
    try {
      await usersService.updateBadge(userId, selected);
      onSaved();
    } catch {
      setError('Não foi possível salvar o selo. Tente novamente.');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return (
    <S.Content>
      <SectionTitle
        title="Selo especial"
        subtitle="Administração de usuários · O selo não altera permissões ou pontuação."
      />
      {[{ value: null, label: 'Sem selo' }, ...USER_BADGE_OPTIONS].map(
        option => (
          <S.Option
            key={option.value ?? 'none'}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{
              checked: selected === option.value,
              disabled: saving,
            }}
            disabled={saving}
            $selected={selected === option.value}
            onPress={() => setSelected(option.value)}
          >
            {option.value ? (
              <UserBadge badge={option.value} />
            ) : (
              <S.Label>Sem selo</S.Label>
            )}
          </S.Option>
        ),
      )}
      {error ? <S.Error accessibilityRole="alert">{error}</S.Error> : null}
      <PrimaryButton
        loading={saving}
        disabled={selected === badge}
        onPress={save}
      >
        Salvar selo
      </PrimaryButton>
    </S.Content>
  );
}
