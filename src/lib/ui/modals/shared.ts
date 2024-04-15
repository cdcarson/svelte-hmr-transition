export type CloseRouteActionModalFn = () => void;
export const modalSizes = ['tiny', 'small', 'medium', 'large', 'max'] as const;
export type ModalSize = (typeof modalSizes)[number];

export const modalPositions = [
  'left',
  'right',
  'top',
  'bottom',
  'centered',
  'fullscreen'
] as const;
export type ModalPosition = (typeof modalPositions)[number];

export const fullScreenBelowBreakpoints = [
  'sm',
  'md',
  'lg',
  'xl',
  '2xl'
] as const;
export type FullScreenBelowBreakpoint =
  (typeof fullScreenBelowBreakpoints)[number];
