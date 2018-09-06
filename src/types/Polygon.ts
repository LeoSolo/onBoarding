import { LatLng } from './LatLng'

export interface Polygon {
    outerBoundary: LatLng[]
    innerBoundary: LatLng[][]
    center: LatLng
    radius: number
}
