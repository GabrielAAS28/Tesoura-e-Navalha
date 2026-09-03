import React from 'react';
import Svg, {Path, Circle, Rect} from 'react-native-svg';

export type IconName =
  | 'scissors'
  | 'home'
  | 'calendar'
  | 'bell'
  | 'star'
  | 'eye'
  | 'chevronRight'
  | 'plus'
  | 'trash'
  | 'clock'
  | 'user'
  | 'scissorsBrand';

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = '#F4F4F5';
const DEFAULT_STROKE_WIDTH = 1.8;

// NOTA: react-native-svg dá a Circle/Path/Rect um `fill` padrão próprio
// ("black"), que NÃO herda o `fill="none"` definido só no <Svg> pai — por
// isso todo elemento abaixo recebe `fill` explícito (via prop `fillValue`).
function renderContent(name: IconName, fillValue: string) {
  switch (name) {
    case 'scissors':
    case 'scissorsBrand':
      // Login.dc.html / Foundations.dc.html
      return (
        <>
          <Circle cx="6" cy="6" r="3" fill={fillValue} />
          <Circle cx="6" cy="18" r="3" fill={fillValue} />
          <Path d="M20 4L8.5 15.5M8.7 9.3L20 20" fill={fillValue} />
        </>
      );
    case 'home':
      // Main.dc.html (tab bar "Início")
      return (
        <>
          <Path d="M3 11l9-8 9 8" fill={fillValue} />
          <Path
            d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"
            fill={fillValue}
          />
        </>
      );
    case 'bell':
      // Main.dc.html (header)
      return (
        <>
          <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" fill={fillValue} />
          <Path d="M10 21a2 2 0 0 0 4 0" fill={fillValue} />
        </>
      );
    case 'calendar':
      // Main.dc.html (tab bar "Agenda")
      return (
        <>
          <Rect x="3" y="5" width="18" height="16" rx="2" fill={fillValue} />
          <Path d="M16 3v4M8 3v4M3 10h18" fill={fillValue} />
        </>
      );
    case 'star':
      // Main.dc.html / Foundations.dc.html (fill-based)
      return (
        <Path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"
          fill={fillValue}
        />
      );
    case 'eye':
      // Login.dc.html
      return (
        <>
          <Path
            d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"
            fill={fillValue}
          />
          <Circle cx="12" cy="12" r="3" fill={fillValue} />
        </>
      );
    case 'chevronRight':
      // Main.dc.html
      return <Path d="M9 6l6 6-6 6" fill={fillValue} />;
    case 'plus':
      // BarbeiroServicos.dc.html / BarbeiroCadastro.dc.html
      return <Path d="M12 5v14M5 12h14" fill={fillValue} />;
    case 'trash':
      // Não encontrado nos mockups; aproximação Feather-style (trash-2)
      return (
        <>
          <Path d="M3 6h18" fill={fillValue} />
          <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill={fillValue} />
          <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" fill={fillValue} />
          <Path d="M10 11v6" fill={fillValue} />
          <Path d="M14 11v6" fill={fillValue} />
        </>
      );
    case 'clock':
      // Agendamento.dc.html
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill={fillValue} />
          <Path d="M12 7v5l3 3" fill={fillValue} />
        </>
      );
    case 'user':
      // Main.dc.html / Perfil.dc.html (tab bar "Perfil")
      return (
        <>
          <Circle cx="12" cy="8" r="4" fill={fillValue} />
          <Path d="M4 21c0-4 4-6 8-6s8 2 8 6" fill={fillValue} />
        </>
      );
    default:
      return null;
  }
}

export default function Icon({
  name,
  size = DEFAULT_SIZE,
  color = DEFAULT_COLOR,
  strokeWidth = DEFAULT_STROKE_WIDTH,
}: IconProps) {
  const isFilled = name === 'star';
  const fillValue = isFilled ? color : 'none';

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fillValue}
      stroke={isFilled ? 'none' : color}
      strokeWidth={isFilled ? undefined : strokeWidth}
      strokeLinecap={isFilled ? undefined : 'round'}
      strokeLinejoin={isFilled ? undefined : 'round'}>
      {renderContent(name, fillValue)}
    </Svg>
  );
}
