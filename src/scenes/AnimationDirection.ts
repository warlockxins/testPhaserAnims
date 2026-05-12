// point of interest 2
export type AnimationDirection = 'N' | 'NE' | 'E' | 'SE' | 'S';
export type AnimationConfig = Record<string, Record<AnimationDirection, string[]>>;
export const AnimationAvaliableDirections: AnimationDirection[] = ['N', 'NE', 'E', 'SE', 'S'];
