import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { forwardRef, useRef } from "react";
import { MutableRefObject, useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";
import Placeholder from "./placeholder";

const useStyles = makeStyles(() => {
    return {
        "dropzone": {
            background: "#0008",
            backdropFilter: "blur(6px)",
            width: '100vw',
            height: "100vh",
            zIndex: 9999,
            position: 'absolute',
            top: 0,
            left: 0,
            "&:not(.show)": {
                display: 'none',
            }
        }
    }
})
export interface DropzoneProps { show: boolean }
export const Dropzone = forwardRef<HTMLDivElement, DropzoneProps>(function Dropzone({ show }, ref) {
    const styles = useStyles()
    return <Placeholder ref={ref} className={clsx(styles.dropzone, show && 'show')} caption="拖动文件到这里" />
})
function noop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
}
export function useDropzone(onChange: (e: { target: { files: FileList } }) => void, onMismatchMime: (file: File) => void, mimeRegExp: RegExp, fileQuantityLimit?: number, onFileToMuch?: (fileCount: number) => void): [boolean, MutableRefObject<HTMLDivElement>, MutableRefObject<HTMLDivElement>, MutableRefObject<HTMLInputElement>] {
    const parentContainerRef = useRef<HTMLDivElement>()
    const portalRef = useRef<HTMLDivElement>()
    const inputRef = useRef<HTMLInputElement>()
    const [files, setFiles] = useState<FileList | null>()
    const [dragEntered, setDragEntered] = useState<boolean>()
    const dropCb = useCallback((e: DragEvent) => {
        e.preventDefault()
        setDragEntered(false)
        const { files } = e.dataTransfer
        if (fileQuantityLimit && files.length > fileQuantityLimit) {
            onFileToMuch(files.length)
            return
        }
        for (const file of files) {
            const result = file.type.match(mimeRegExp)
            if (!result) {
                onMismatchMime(file)
                return
            }
        }
        setFiles(files)
    }, [onMismatchMime, mimeRegExp])
    const handleDragEnter = useCallback(() => {
        setDragEntered(true)
    }, [])
    const handleDragLeave = useCallback((e: DragEvent) => {
        const { target } = e
        if (target == parentContainerRef.current || target == portalRef.current) setDragEntered(false)
    }, [parentContainerRef, portalRef])
    useEffect(() => {
        const parentContainer = document.documentElement
        parentContainer.addEventListener('dragenter', handleDragEnter, false)
        parentContainer.addEventListener('dragleave', handleDragLeave, false)
        parentContainer.addEventListener('dragover', noop)
        parentContainer.addEventListener('drop', dropCb)
        return () => {
            parentContainer.removeEventListener('dragenter', handleDragEnter)
            parentContainer.removeEventListener('dragleave', handleDragLeave)
            parentContainer.removeEventListener('dragover', noop)
            parentContainer.removeEventListener('drop', dropCb)
        }
    }, [])
    useEffect(() => {
        inputRef.current.files = files
        onChange({ target: { files } })
    }, [files, inputRef, onChange, fileQuantityLimit])
    return [dragEntered, parentContainerRef, portalRef, inputRef,]
}