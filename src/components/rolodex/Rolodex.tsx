import * as React from 'react'

import { Roller } from './Roller'

import '../../styles/components/RolodexPicker.scss'

export interface RolodexData<T> {
    hasPrev: boolean
    hasNext: boolean
    prevValue?: T
    currentValue: T
    nextValue?: T
    movePrev?: () => void
    moveNext?: () => void
    render?: (value: T) => JSX.Element
}

export interface RolodexProps {
    data: RolodexData<any>[]
    showFooter?: boolean
    showHeader?: boolean
    headerRender?: () => JSX.Element
    footerRender?: () => JSX.Element
    buttonClasses?: {
        up?: string
        down?: string
    }
}

interface RolodexState {}

export class Rolodex extends React.Component<RolodexProps, RolodexState> {

    constructor(props: any) {
        super(props)
    }

    render() {
        return (
            <div className="rolodex">
                {this.props.showHeader && this.rolodexHeader()}
                {this.rolodexContent()}
                {this.props.showFooter && this.rolodexFooter()}
            </div>
        )
    }

    private rolodexHeader = () => {
        return (
            <div className="rolodex-header">
                {this.props.headerRender ? this.props.headerRender() : undefined}
            </div>
        )
    }
    private rolodexFooter = () => {
        return (
            <div className="rolodex-footer">
                {this.props.footerRender ? this.props.footerRender() : undefined}
            </div>
        )
    }
    private rolodexContent = () => {
        return (
            <div className="rolodex-content">
                {this.props.data.map((data, index) => {
                    return (
                        <Roller
                            buttonClasses={this.props.buttonClasses}
                            hasNext={data.hasNext}
                            hasPrev={data.hasPrev}
                            currentValue={data.currentValue}
                            nextValue={data.nextValue}
                            prevValue={data.prevValue}
                            moveNext={data.moveNext}
                            movePrev={data.movePrev}
                            dataRender={data.render}
                            key={index}
                        />
                    )
                })}
            </div>
        )
    }

}
