import { useState, useCallback, ChangeEventHandler } from "react"

export function useUploadImage(){
    const [currentImageUrl, setImageBlobUrl] = useState<string>('')
export function useUploadImage(): [string, (e:{target:{files:FileList}})=>void] {
    const changeImage = useCallback(
        async (e) => {
            const files = e.target.files
            if (files && files.length > 0) {
                const buf = new Blob([await files[0].arrayBuffer()])
                if (currentImageUrl) URL.revokeObjectURL(currentImageUrl)
                setImageBlobUrl(URL.createObjectURL(buf))
            }
        }, [])
    return [currentImageUrl, changeImage]
}