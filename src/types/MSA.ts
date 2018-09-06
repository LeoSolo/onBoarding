import { Polygon } from './Polygon'

export interface MSA {
    id: string
    isCounty: boolean
    levelType: number
    modifyDate: number
    name: string
    parentId: string
    path: string
    rootId: string
    zipRange: string
    adjacentMsa: string[]
    coordinates: Polygon[]
}
