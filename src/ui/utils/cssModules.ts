/**
 * cx() — conditional class binding utility for CSS Modules.
 *
 * Usage: cx(styles.root, isActive && styles.active, className)
 */
export function cx(...args: (string | false | null | undefined)[]): string {
  return args.filter(Boolean).join(' ')
}
