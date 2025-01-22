export const navBarHeight = "3.8rem";
export const footerHeight = "2rem";
export const bodyPaddingX = "2rem";
export const bodyHeight = `calc(100vh - ${navBarHeight} - ${footerHeight})`;
export const bodyWidth = `calc(100vw - ${bodyPaddingX} * 2)`;
export function bodyHeightPercentage(percentage: number) {
  return `calc(${percentage * 100}vh - ${navBarHeight} - ${footerHeight})`;
}
export function bodyHeightOffset(offset: number) {
  return `calc(100vh - ${navBarHeight} - ${footerHeight} - ${offset}px)`;
}
