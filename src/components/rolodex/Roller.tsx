import * as React from 'react'
import * as classnames from 'classnames'

import '../../styles/components/RolodexPicker.scss'

interface RollerProps<T> {
    prevValue?: T
    currentValue: T
    nextValue?: T
    hasPrev: boolean
    hasNext: boolean
    movePrev?: () => void
    moveNext?: () => void
    dataRender?: (value: T | undefined) => JSX.Element
    buttonClasses?: {
        up?: string
        down?: string
    }
}

interface RollerState<T> {
    onFocus: boolean
}

export class Roller<T> extends React.Component<RollerProps<T>, RollerState<T>> {

    static defaultProps: Partial<RollerProps<any>> = {
        dataRender: (value) => { return (<span>{value}</span>) },
        buttonClasses: {
            up: 'btn up',
            down: 'btn down'
        }
    }

    constructor(props: any) {
        super(props)
        this.state = {
            onFocus: false
        }
    }

    onMouseOver = () => {
        if (!this.state.onFocus) {
            this.setState({
                onFocus: true
            })
        }
    }

    onMouseLeave = () => {
        if (this.state.onFocus) {
            this.setState({
                onFocus: false
            })
        }
    }

    onUpBtnClick = (e: any) => {
		e.preventDefault()
        if (this.props.hasPrev && this.props.movePrev) {
            this.props.movePrev()
        }
    }

    onDownBtnClick = (e: any) => {
		e.preventDefault()
        if (this.props.hasNext && this.props.moveNext) {
            this.props.moveNext()
        }
    }

    onScroll = (e: React.WheelEvent<any>) => {
		e.preventDefault()
        if (e.deltaY > 0 && this.props.hasNext && this.props.moveNext) {
            this.props.moveNext()
        } else if (e.deltaY < 0 && this.props.hasPrev && this.props.movePrev) {
            this.props.movePrev()
        }
    }

    render() {
        let renderValue = (value?: T) => {
            return this.props.dataRender ? this.props.dataRender(value) : (<span/>)
        }
        return (
            <div
                className="roller"
                onMouseOver={this.onMouseOver}
                onMouseLeave={this.onMouseLeave}
                onWheel={this.state.onFocus ? this.onScroll : undefined}
            >
                <button
                    type="button"
                    className={classnames(this.props.buttonClasses ? this.props.buttonClasses.up : '', { active: this.props.hasPrev })}
                    onClick={this.onUpBtnClick}
                    disabled={!this.props.hasPrev}
                />
                <div className="value not-current prev">
                    {renderValue(this.props.prevValue)}
                </div>
                <div className={classnames('value current active')}>
                    {renderValue(this.props.currentValue)}
                </div>
                <div className="value not-current next">
                    {renderValue(this.props.nextValue)}
                </div>
                <button
                    type="button"
                    className={classnames(this.props.buttonClasses ? this.props.buttonClasses.down : '', { active: this.props.hasNext })}
                    onClick={this.onDownBtnClick}
                    disabled={!this.props.hasNext}
                />
            </div>
        )
    }

}
