import { useEffect, useState, useCallback, ChangeEventHandler } from "react"

export function useUploadImage(): [string, (e:{target:{files:FileList}})=>void] {
    const [currentImageUrl, setImageBlobUrl] = useObjectURL()
    const changeImage = useCallback(
        (e) => {
            const files = e.target.files
            if (files && files.length > 0) {
                const buf = files[0]
                setImageBlobUrl(URL.createObjectURL(buf))
            }
        }, [])
    return [currentImageUrl, changeImage]
}
export type UseURL_Setter = (url: string) => void
export function useObjectURL(): [string, UseURL_Setter] {
    const [value, set] = useState<string>('')
    const setURL = useCallback((url: string) => {
        URL.revokeObjectURL(value)
        set(url)
    }, [])
    useEffect(() => () => {
        //删除组件时回收URL资源
        URL.revokeObjectURL(value)
    }, [])
    return [value, setURL]
}