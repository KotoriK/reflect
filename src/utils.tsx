import { SliderTypeMap } from "@material-ui/core"
import { OverrideProps } from "@material-ui/core/OverridableComponent"
const _mapRange = value => { return { value, label: value } }
/**
 * 将给定的范围转换为Slider的prop
 * @param value 
 * @returns 
 */
export const mapRangeToSliderProp: (value: number[]) => Pick<OverrideProps<SliderTypeMap, 'span'>, 'min' | 'max' | 'marks'> = (value) => {
    return {
        min: value[0],
        max: value[value.length - 1],
        marks: value.map(_mapRange)
    }
}
export const max = (a: number, b: number) => a > b ? a : b