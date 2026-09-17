import React from "react";

interface TablePartProps {
  children?: React.ReactNode;
  className?: string;
}

interface TableCellProps extends TablePartProps {
  /** Renders a <th> instead of a <td>. */
  isHeader?: boolean;
  colSpan?: number;
}

export const Table = ({ children, className }: TablePartProps) => (
  <table className={className}>{children}</table>
);

export const TableHeader = ({ children, className }: TablePartProps) => (
  <thead className={className}>{children}</thead>
);

export const TableBody = ({ children, className }: TablePartProps) => (
  <tbody className={className}>{children}</tbody>
);

export const TableRow = ({ children, className }: TablePartProps) => (
  <tr className={className}>{children}</tr>
);

export const TableCell = ({
  children,
  className,
  isHeader = false,
  colSpan,
}: TableCellProps) => {
  const Cell = isHeader ? "th" : "td";
  return (
    <Cell className={className} colSpan={colSpan}>
      {children}
    </Cell>
  );
};
