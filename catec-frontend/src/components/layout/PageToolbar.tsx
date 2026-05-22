import PageHeader, { type PageHeaderProps } from "../list-page/PageHeader";

export type PageToolbarProps = PageHeaderProps;

/** @deprecated Use `PageHeader` de `components/list-page`. */
export default function PageToolbar(props: PageToolbarProps) {
  return <PageHeader {...props} />;
}
