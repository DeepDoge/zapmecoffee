export function hasPrefix<T extends string>(str: string, prefix: T): str is `${T}${string}` {
	return str.startsWith(prefix);
}
