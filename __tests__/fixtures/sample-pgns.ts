// Sample PGN files for testing
// Using simple, verified games

export const SIMPLE_GAME = `[Event "Casual Game"]
[Site "lichess.org"]
[Date "2024.01.01"]
[Round "?"]
[White "Player1"]
[Black "Player2"]
[Result "1-0"]
[WhiteElo "1800"]
[BlackElo "1750"]
[TimeControl "600+5"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 1-0`;

// Scholar's mate - simple and valid
export const GAME_WITH_PROMOTION = `[Event "Test Game"]
[Site "test"]
[Date "2024.01.01"]
[White "Player1"]
[Black "Player2"]
[Result "*"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

// Real Lichess game - validated
export const LICHESS_EXPORT = `[Event "Winter Arena"]
[Site "lichess.org"]
[Date "2017.12.28"]
[Round "?"]
[White "Lance5500"]
[Black "TryingHard87"]
[Result "1/2-1/2"]
[WhiteElo "2389"]
[BlackElo "2498"]
[TimeControl "300+3"]
[ECO "D31"]
[Opening "Semi-Slav Defense: Marshall Gambit"]

1. d4 d5 2. c4 c6 3. Nc3 e6 4. e4 Nd7 5. exd5 cxd5 6. cxd5 exd5 7. Nxd5 Nb6 8. Bb5+ Bd7 9. Qe2+ Ne7 10. Nxb6 Qxb6 11. Bxd7+ Kxd7 12. Nf3 Qa6 13. Ne5+ Ke8 14. Qf3 f6 15. Nd3 Qc6 16. Qe2 Kf7 17. O-O Kg8 18. Bd2 Re8 19. Rac1 Nf5 20. Be3 Qe6 21. Rfe1 g6 22. b3 Bd6 23. Qd2 Kf7 24. Bf4 Qd7 25. Bxd6 Nxd6 26. Nc5 Rxe1+ 27. Rxe1 Qc6 28. f3 Re8 29. Rxe8 Nxe8 30. Kf2 Nc7 31. Qb4 b6 32. Qc4+ Nd5 33. Nd3 Qe6 34. Nb4 Ne7 35. Qxe6+ Kxe6 36. Ke3 Kd6 37. g3 h6 38. Kd3 h5 39. Nc2 Kd5 40. a3 Nc6 41. Ne3+ Kd6 42. h4 Nd8 43. g4 Ne6 44. Ke4 Ng7 45. Nc4+ Ke6 46. d5+ Kd7 47. a4 g5 48. gxh5 Nxh5 49. hxg5 fxg5 50. Kf5 Nf4 51. Ne3 Nh3 52. Kg4 Ng1 53. Nc4 Kc7 54. Nd2 Kd6 55. Kxg5 Kxd5 56. f4 Nh3+ 57. Kg4 Nf2+ 58. Kf3 Nd3 59. Ke3 Nc5 60. Kf3 Ke6 61. Ke3 Kf5 62. Kd4 Ne6+ 63. Kc4 1/2-1/2`;

export const CHESS_COM_EXPORT = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2024.11.04"]
[Round "?"]
[White "ChessComPlayer"]
[Black "TestPlayer"]
[Result "1/2-1/2"]
[ECO "B00"]
[WhiteElo "1823"]
[BlackElo "1856"]
[TimeControl "600"]
[EndTime "16:45:32 PST"]
[Termination "Game drawn by agreement"]

1. e4 Nc6 2. Nf3 d6 3. d4 Nf6 4. Nc3 Bg4 5. Be3 e5 6. d5 Ne7 7. Be2 Ng6
8. Nd2 Bxe2 9. Qxe2 Be7 10. O-O-O O-O 11. f3 c6 12. g4 cxd5 13. Nxd5 Nxd5
14. exd5 Bg5 15. f4 exf4 16. Bxf4 Bxf4 17. Kb1 Rc8 18. h4 Qb6 19. h5 Ne5
20. Nc4 Nxc4 21. Qxc4 Qc5 22. Qxc5 Rxc5 23. c3 Rfc8 24. Rd3 Bd2 25. Rc1 Bxc3
26. bxc3 Rxc3 1/2-1/2`;

export const INVALID_PGN = `This is not a valid PGN format at all!`;

export const MINIMAL_PGN = `1. e4 e5 2. Nf3`;

export const PGN_WITH_COMMENTS = `[Event "Test"]
[White "P1"]
[Black "P2"]
[Result "*"]

1. e4 { Best by test! } e5 2. Nf3 { Developing the knight } Nc6 3. Bb5 { The Ruy Lopez } *`;

export const PGN_WITH_VARIATIONS = `[Event "Test"]
[White "P1"]
[Black "P2"]
[Result "*"]

1. e4 e5 (1... c5 { Sicilian is also good } 2. Nf3) 2. Nf3 Nc6 *`;
