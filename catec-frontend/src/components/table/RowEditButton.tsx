import TableAction, { type TableActionProps } from "../list-page/TableAction";

export type RowEditButtonProps = Omit<TableActionProps, "variant">;

/** @deprecated Use `TableAction` de `components/list-page`. */
export default function RowEditButton(props: RowEditButtonProps) {
  return <TableAction variant="edit" {...props} />;
}
