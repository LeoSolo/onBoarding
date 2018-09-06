import * as React from 'react'
import { GoogleMap, Polygon, PolygonProps, withGoogleMap } from 'react-google-maps'

import * as MAP_CONSTANTS from '../constants/mapConstants'

import * as Types from '../types'

enum MSAType {
    HaulerMSA = 1,
    HaulerRequestedMSA = 2,
    AdjacentMSA = 3
}

interface MapProps {
    center: Types.LatLng
    haulerMSA?: Types.HaulerMSAInfo[]
    haulerRequestedMSA?: Types.HaulerMSAInfo[]
    adjacentMSA?: Types.MSA[]
    onClickHaulerMSA?: (msa: Types.MSA) => void
    onClickRequestedMSA?: (msa: Types.MSA) => void
    onClickAdjacentMSA?: (msa: Types.MSA) => void
}

interface MapState {}

class Map extends React.Component<MapProps, MapState> {

    public static defaultProps = {
        center: { lat: 0, lng: 0 }
    }

    constructor(props: any) {
        super(props)
    }

    msaToPolygons = (msaType: MSAType) => {
        return (msa: Types.MSA) => {
            let polygons: any[] = []
            if (msa.coordinates) {
                let innerPaths: any[] = []
                msa.coordinates.forEach(coordinates => {
                    innerPaths.push(coordinates.outerBoundary)
                    /*if (coordinates.innerBoundary) {
                        coordinates.innerBoundary.forEach(bound => innerPaths.push(bound))
                    }*/
                    let polygonProps: PolygonProps = {
                        paths: innerPaths
                    }
                    switch (msaType) {
                        case MSAType.HaulerMSA: {
                            polygonProps = {
                                ...polygonProps,
                                options: {
                                    ...MAP_CONSTANTS.STYLES.polygonHaulerStyle,
                                    clickable: this.props.onClickHaulerMSA ? true : false
                                },
                                onClick: _ => {
                                    if (this.props.onClickHaulerMSA) {
                                        this.props.onClickHaulerMSA(msa)
                                    }
                                }
                            }
                            break
                        }
                        case MSAType.HaulerRequestedMSA: {
                            polygonProps = {
                                ...polygonProps,
                                options: {
                                    ...MAP_CONSTANTS.STYLES.polygonRequestedHaulerStyle,
                                    clickable: this.props.onClickRequestedMSA ? true : false
                                },
                                onClick: _ => {
                                    if (this.props.onClickRequestedMSA) {
                                        this.props.onClickRequestedMSA(msa)
                                    }
                                }
                            }
                            break
                        }
                        case MSAType.AdjacentMSA: {
                            polygonProps = {
                                ...polygonProps,
                                options: {
                                    ...MAP_CONSTANTS.STYLES.polygonStyle,
                                    clickable: this.props.onClickAdjacentMSA ? true : false
                                },
                                onClick: _ => {
                                    if (this.props.onClickAdjacentMSA) {
                                        this.props.onClickAdjacentMSA(msa)
                                    }
                                }
                            }
                        }
                    }
                    polygons.push(polygonProps)
                })
            }
            return polygons
        }
    }

    prepareHaulerMSAInfo = (msas: Types.HaulerMSAInfo[], msaType: MSAType) => {
        return [].concat(...(msas.map(haulerMSAInfo => { return haulerMSAInfo.msa })
        .map(this.msaToPolygons(msaType)) as any[]))
    }

    render() {
        return (
            <GoogleMap
                defaultZoom={8}
                center={this.props.center}
                options={{
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: true,
                    streetViewControl: false
                }}
            >
                { this.props.haulerMSA && (
                        this.prepareHaulerMSAInfo(this.props.haulerMSA, MSAType.HaulerMSA)
                        .map((polygon, index) => {
                            return (<Polygon key={index} {...polygon} />)
                        })
                    )
                }
                { this.props.haulerRequestedMSA && (
                        this.prepareHaulerMSAInfo(this.props.haulerRequestedMSA, MSAType.HaulerRequestedMSA)
                        .map((polygon, index) => {
                            return (<Polygon key={index} {...polygon} />)
                        })
                    )
                }
                { this.props.adjacentMSA && (
                        [].concat(...(this.props.adjacentMSA.map(this.msaToPolygons(MSAType.AdjacentMSA)) as any[]))
                        .map((polygon, index) => {
                            return (<Polygon key={index} {...polygon} />)
                        })
                    )
                }
            </GoogleMap>
        )
    }
}

export const GMap = withGoogleMap(Map)
