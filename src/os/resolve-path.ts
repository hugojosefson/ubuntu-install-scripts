export default (path: string): string =>
  path.replace(
    "~",
    () => Deno.env.get("HOME") || "~",
  );
