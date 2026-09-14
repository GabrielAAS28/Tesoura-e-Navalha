import styled from 'styled-components/native';
import {hexToRgba} from '~/utils/color';

export const Screen = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.bg};
`;

export const Scroller = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  showsVerticalScrollIndicator: false,
  keyboardShouldPersistTaps: 'handled' as const,
})`
  flex: 1;
`;

export const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

export const HeaderLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const BackButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const HeaderTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 20px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const StepBadge = styled.View`
  height: 26px;
  padding-horizontal: 12px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => hexToRgba(theme.colors.accent, 0.15)};
  align-items: center;
  justify-content: center;
`;

export const StepBadgeLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 11px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;

export const Content = styled.View`
  gap: ${({theme}) => theme.spacing.xl}px;
`;

export const PhotoBlock = styled.View`
  align-items: center;
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const PhotoCircle = styled.View`
  width: 96px;
  height: 96px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1.5px;
  border-style: dashed;
  border-color: ${({theme}) => theme.colors.border};
  align-items: center;
  justify-content: center;
`;

export const PhotoAddBadge = styled.View`
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 30px;
  height: 30px;
  border-radius: ${({theme}) => theme.radius.full}px;
  background-color: ${({theme}) => theme.colors.accent};
  border-width: 2px;
  border-color: ${({theme}) => theme.colors.bg};
  align-items: center;
  justify-content: center;
`;

export const PhotoLabel = styled.TouchableOpacity``;

export const PhotoLabelText = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 13px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;

export const FormBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const FieldGroup = styled.View`
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const FieldLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const PhoneFieldContainer = styled.View`
  height: 52px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  flex-direction: row;
  align-items: center;
  padding: 0px 6px 0px 14px;
  gap: 10px;
`;

export const PhonePrefix = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding-right: 10px;
  border-right-width: 1px;
  border-right-color: ${({theme}) => theme.colors.border};
`;

export const PhoneFlag = styled.Text`
  font-size: 15px;
`;

export const PhoneCode = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 14px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const PhoneInput = styled.TextInput`
  flex: 1;
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const SectionBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const SectionTitle = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 15px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const ChipsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const Chip = styled.TouchableOpacity<{selected: boolean}>`
  height: 44px;
  padding-horizontal: ${({theme}) => theme.spacing.md}px;
  border-radius: ${({theme}) => theme.radius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({selected, theme}) => (selected ? theme.colors.accent : 'transparent')};
  border-width: ${({selected}) => (selected ? 0 : 1)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const ChipLabel = styled.Text<{selected: boolean}>`
  font-family: ${({selected, theme}) => (selected ? theme.font.bold : theme.font.semibold)};
  font-size: 13px;
  font-weight: ${({selected}) => (selected ? 700 : 600)};
  color: ${({selected, theme}) => (selected ? theme.colors.bg : theme.colors.textPrimary)};
`;

export const SegmentRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

export const SegmentItem = styled.TouchableOpacity<{selected: boolean}>`
  flex: 1;
  height: 44px;
  border-radius: ${({theme}) => theme.radius.md}px;
  align-items: center;
  justify-content: center;
  background-color: ${({selected, theme}) => (selected ? theme.colors.accent : 'transparent')};
  border-width: ${({selected}) => (selected ? 0 : 1)}px;
  border-color: ${({theme}) => theme.colors.border};
`;

export const SegmentLabel = styled.Text<{selected: boolean}>`
  font-family: ${({selected, theme}) => (selected ? theme.font.bold : theme.font.semibold)};
  font-size: 12px;
  font-weight: ${({selected}) => (selected ? 700 : 600)};
  color: ${({selected, theme}) => (selected ? theme.colors.bg : theme.colors.textPrimary)};
`;

export const BioContainer = styled.View`
  height: 96px;
  border-radius: ${({theme}) => theme.radius.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
  padding: 14px;
`;

export const BioInput = styled.TextInput`
  flex: 1;
  font-family: ${({theme}) => theme.font.medium};
  font-size: 14px;
  font-weight: 500;
  color: ${({theme}) => theme.colors.textPrimary};
`;

export const OtpBlock = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

export const OtpHelperText = styled.Text`
  font-family: ${({theme}) => theme.font.regular};
  font-size: 12px;
  font-weight: 400;
  color: ${({theme}) => theme.colors.textSecondary};
`;

export const OtpChangePhoneLink = styled.TouchableOpacity`
  align-self: center;
  padding: ${({theme}) => theme.spacing.xs}px;
`;

export const OtpChangePhoneLabel = styled.Text`
  font-family: ${({theme}) => theme.font.semibold};
  font-size: 12px;
  font-weight: 600;
  color: ${({theme}) => theme.colors.accent};
`;
