import { Chessboard } from 'react-chessboard';

interface PlayerChessboardProps {
  position: string;
  playerColor: string;
  options?: Record<string, unknown>;
}

/**
 * Chessboard component that automatically orients based on player color.
 * Use this instead of the raw Chessboard component to ensure consistent
 * board orientation throughout the app.
 */
export function PlayerChessboard({ position, playerColor, options = {} }: PlayerChessboardProps) {
  return (
    <Chessboard
      options={{
        position,
        boardOrientation: playerColor === 'black' ? 'black' : 'white',
        allowDragging: false,
        ...options,
      }}
    />
  );
}
