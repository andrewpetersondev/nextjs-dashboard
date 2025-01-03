type Props = {
  placeholder: "Search customers...";
};

export default function Search({ placeholder }: Props) {
  console.log(placeholder);
  return "search";
}