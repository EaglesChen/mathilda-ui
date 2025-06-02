export const convertValueType = (value: any, targetType: string) => {
    if (value === null || value === undefined) return null
    
    switch(targetType.toLowerCase()) {
        case 'int':
            return Number.isInteger(value) ? value : parseInt(value, 10)
        case 'float':
            return typeof value === 'number' ? value : parseFloat(value)
        case 'string':
            return value.toString()
        default:
            return value
    }
}