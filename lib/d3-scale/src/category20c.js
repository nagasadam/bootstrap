import colors from "./colors";
import ordinal from "./ordinal";

var colors20c = colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

export default function() {
  return ordinal().range(colors20c);
}
