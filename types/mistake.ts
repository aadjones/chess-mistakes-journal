export interface Mistake {
  id: string;
  gameId: string;
  moveNumber: number;
  fenPosition: string;
  briefDescription: string;
  primaryTag: string;
  detailedReflection?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMistakeInput {
  gameId: string;
  moveNumber: number;
  fenPosition: string;
  briefDescription: string;
  primaryTag: string;
  detailedReflection?: string;
}

export interface UpdateMistakeInput {
  briefDescription?: string;
  primaryTag?: string;
  detailedReflection?: string;
}
