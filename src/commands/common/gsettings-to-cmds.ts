export function gsettingsToCmds(gsettings: string): string[][] {
  const trim = (line: string) => line.trim();
  const isNotEmpty = (line: string): boolean => line.length > 0;
  const isNotComment = (line: string): boolean => /^[a-z0-9_]/i.test(line);

  const split = (line: string) =>
    line.match(/^([^ ]+) ([^ ]+) (.+)/) as [string, string, string, string];

  return gsettings
    .split("\n")
    .map(trim)
    .filter(isNotEmpty)
    .filter(isNotComment)
    .map(split)
    .map(([_line, schema, key, value]) => [schema, key, value])
    .map(([schema, key, value]) => ["gsettings", "set", schema, key, value]);
}
