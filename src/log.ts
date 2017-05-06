
// side effects for log functionality

export const warn = (source: string, description: string) => console.warn(`source: ${source}, description: ${description}`)

export const error = (source: string, description: string) => console.error(`source: ${source}, description: ${description}`)


export const logFns = {
  warn,
  error,
}
