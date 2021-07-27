//🐴🐴🐴🐴🐴🐴🐴🐴🐴🐴=10
import { useCallback, useEffect, useRef } from "react";
const HORSE = '🐴'
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
export default function useHorse() {
    const _title = useRef<string>()
    const handler = useCallback(() => {
        let isHidden = document.visibilityState == "hidden"
        if (isHidden) {
            sleep(1500).then(() => {
                document.title = '🐴'
            })
                .then(async () => {
                    let count = 0
                    const addHorse = async () => {
                        if (document.visibilityState == "hidden") {
                            if (count < 9) {
                                document.title += HORSE
                                count++
                                await sleep(1000)
                                addHorse()
                            }
                        } else {
                            document.title = _title.current
                        }
                    }
                    sleep(1000).then(addHorse)
                })
        } else {
            document.title = _title.current
        }
    }, [_title.current])
    useEffect(() => {
        _title.current = document.title
    }, [])
    useEffect(() => {
        document.addEventListener("visibilitychange", handler)
        return () => {
            document.removeEventListener("visibilitychange", handler)
        }
    }, [handler])
}