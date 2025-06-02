export function deepAssign<T>(target: T, source: Partial<T>): T {
  Object.keys(source).forEach(key => {
    const sourceValue = (source as any)[key]
    const targetValue = (target as any)[key]

    if (typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      deepAssign(targetValue, sourceValue)
    } else {
      ; (target as any)[key] = sourceValue
    }
  })
  return target
}


export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}