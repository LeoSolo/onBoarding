import * as React from 'react'
import * as classnames from 'classnames'

import { Rolodex, RolodexProps } from './Rolodex'

import '../../styles/components/RolodexPicker.scss'

interface RolodexPickerProps extends RolodexProps {
    inline?: boolean
    placeholder?: string
    value?: string
    readonly?: boolean
    className?: string
    onRef?: (picker?: RolodexPicker) => void
	onOpen?: () => void
    onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

interface RolodexPickerState {
    showPopup: boolean
    popUpCoords?: {
        top: number,
		left?: number
		right?: number
    }
}

export class RolodexPicker extends React.Component<RolodexPickerProps,RolodexPickerState> {

    static defaultProps: Partial<RolodexPickerProps> = {
        inline: true
    }

    private inputRef
    private popupRef

    constructor(props: any) {
        super(props)
        this.state = {
            showPopup: false
        }
        this.inputRef = React.createRef()
        this.popupRef = React.createRef()
    }

    componentDidMount() {
        if (this.props.onRef) {
            this.props.onRef(this)
		}
		window.addEventListener('mousedown', this.handleClickOutside)
	}

    componentWillUnmount() {
        if (this.props.onRef) {
            this.props.onRef(undefined)
		}
		window.removeEventListener('mousedown', this.handleClickOutside)
    }

    public hide = () => {
        this.setState({
            showPopup: false
        })
	}

	handleClickOutside = (e: any) => {
		let y = e.clientY
		let x = e.clientX
		let popup: HTMLDivElement = this.popupRef.current
		let popupRect = popup.getBoundingClientRect()
		if ((x < popupRect.left || x > popupRect.right) || (y < popupRect.top || y > popupRect.bottom)) {
			this.setState({
				showPopup: false
			})
		}
	}

    onInputClick = (e: any) => {
        this.setState(prevState => {
            return {
                ...prevState,
                showPopup: true
            }
        }, () => {
            if (this.props.inline && this.inputRef.current && this.popupRef.current) {
                let input: HTMLInputElement = this.inputRef.current
				let popup: HTMLDivElement = this.popupRef.current
                if (popup.clientWidth > input.clientWidth) {
                    let top = input.clientHeight + input.offsetTop
					let left = input.offsetLeft - popup.clientWidth + input.clientWidth
					let right = input.offsetLeft + popup.clientWidth - input.clientWidth
					if ((left + popup.clientWidth) > window.innerWidth) {
						this.setState({
							popUpCoords: {
								top: top,
								right: right
							}
						})
					} else {
						if (left < 0) {
							left = input.offsetLeft
						}
						this.setState({
							popUpCoords: {
								top: top,
								left: left
							}
						})
					}
                } else {
                    this.setState({
                        popUpCoords: undefined
                    })
				}
				let popupContainerRect = popup.getBoundingClientRect()
				if (window.innerHeight < (popupContainerRect.bottom + 5)) {
					window.scrollBy(0, popupContainerRect.bottom + 5 - window.innerHeight)
				}
            }
        })
        if (this.props.onOpen) {
            this.props.onOpen()
        }
    }

    containerBlur = (e: any) => {
        let target = e.currentTarget
        setTimeout(() => {
            if (!target.contains(document.activeElement)) {
                this.setState({
                    showPopup: false
                })
            }
        }, 0)
	}

    render() {
        return (
            <div className={classnames('rolodex-picker-wrapper', this.props.className)}>
                <input
                    ref={this.inputRef}
                    className="rolodex-input"
                    onClick={this.onInputClick}
                    onFocus={this.onInputClick}
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    readOnly={this.props.readonly}
                    onChange={this.props.onInputChange}
                />
				<div
					ref={this.popupRef}
					style={this.state.popUpCoords}
					className={classnames('rolodex-popup', { disabled: !this.state.showPopup })}
				>
                    <Rolodex
                        showHeader={this.props.showHeader}
                        showFooter={this.props.showFooter}
                        headerRender={this.props.headerRender}
                        footerRender={this.props.footerRender}
                        buttonClasses={this.props.buttonClasses}
                        data={this.props.data}
                    />
				</div>
            </div>
        )
    }

 }
