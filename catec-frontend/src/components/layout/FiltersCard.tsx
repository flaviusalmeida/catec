import FilterCard, { type FilterCardProps } from "../list-page/FilterCard";

export type FiltersCardProps = FilterCardProps;

/** @deprecated Use `FilterCard` de `components/list-page`. */
export default function FiltersCard(props: FiltersCardProps) {
  return <FilterCard {...props} />;
}
