export function buildRoute(
  route: string,
  params: Record<string, string | number>,
): string {
  return Object.keys(params).reduce(
    (path, key) =>
      path.replace(`:${key}`, encodeURIComponent(params[key].toString())),
    route,
  );
}
