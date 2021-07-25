import { useState, useCallback } from "react"

/**
 * 快速创建一个可以传给受控组件的SetState，支持onChange事件参数格式为(Event,newValue)的受控组件
 * @param initialValue 
 * @returns 
 */
export default function useControlledValue<T>(initialValue?: T) {
    const [value, set] = useState(initialValue)
    const cb = useCallback((_, next: T) => {
        set(next)
    }, [])
    return [value, cb] as [T, (_: any, next: T) => void]
}