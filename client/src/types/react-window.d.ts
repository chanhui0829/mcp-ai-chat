import { Component, ReactNode } from 'react';

declare module 'react-window' {
  export interface ListChildComponentProps {
    index: number;
    style: React.CSSProperties;
    data?: any;
  }

  export interface FixedSizeListProps {
    children: (props: ListChildComponentProps) => ReactNode;
    height: number;
    itemCount: number;
    itemSize: number;
    width: number | string;
    className?: string;
  }
  export class FixedSizeList extends Component<FixedSizeListProps> {}

  export const FixedSizeList: React.FC<FixedSizeListProps>;
}
