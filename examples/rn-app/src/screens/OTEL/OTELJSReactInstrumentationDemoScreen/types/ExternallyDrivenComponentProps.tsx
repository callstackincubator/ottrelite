/**
 * Props for a test component that should rerender only when its props change
 */
export type ExternallyDrivenComponentProps = {
  formattedDate: string;
  rerenderCount: number;
};
