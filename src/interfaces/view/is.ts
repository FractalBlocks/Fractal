// Copied from snabbdom
// Commit: https://github.com/snabbdom/snabbdom/commit/f552b0e8eda30a84e59f212e98651463ec71a53f
export const array = Array.isArray

/* istanbul ignore next */
export function primitive(s: any): s is (string | number) {
  return typeof s === 'string' || typeof s === 'number';
}
