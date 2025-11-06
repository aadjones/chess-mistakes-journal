export interface Mistake {
  id: string;
  gameId: string;
  moveIndex: number;
  fenPosition: string;
  briefDescription: string;
  primaryTag: string;
  detailedReflection?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMistakeInput {
  gameId: string;
  moveIndex: number;
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
