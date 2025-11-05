import { Chessboard } from 'react-chessboard';

interface PlayerChessboardProps {
  position: string;
  playerColor: string;
  customSquareStyles?: Record<string, React.CSSProperties>;
}

/**
 * Chessboard component that automatically orients based on player color.
 * Use this instead of the raw Chessboard component to ensure consistent
 * board orientation throughout the app.
 */
export function PlayerChessboard({
  position,
  playerColor,
  customSquareStyles = {},
}: PlayerChessboardProps) {
  return (
    <Chessboard
      options={{
        position,
        boardOrientation: playerColor === 'black' ? 'black' : 'white',
        allowDragging: false,
        squareStyles: customSquareStyles,
      }}
    />
  );
}
