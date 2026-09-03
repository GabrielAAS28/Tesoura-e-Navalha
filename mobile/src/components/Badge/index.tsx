import React from 'react';
import {useTheme} from 'styled-components/native';
import {AppointmentStatus} from '~/types';
import {Pill, Label} from './styles';

export type BadgeProps = {
  status: AppointmentStatus;
};

export default function Badge({status}: BadgeProps) {
  const theme = useTheme();

  const statusMap: Record<AppointmentStatus, {label: string; color: string}> = {
    pending: {label: 'Pendente', color: theme.colors.textSecondary},
    confirmed: {label: 'Confirmado', color: theme.colors.accent},
    completed: {label: 'Concluído', color: theme.colors.success},
    cancelled: {label: 'Cancelado', color: theme.colors.error},
  };

  const {label, color} = statusMap[status];

  return (
    <Pill color={color}>
      <Label color={color}>{label}</Label>
    </Pill>
  );
}
