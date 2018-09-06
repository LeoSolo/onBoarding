import * as React from 'react'
import * as classnames from 'classnames'

import '../styles/components/LoadingSpinner.scss'

interface LoadingSpinnerProps {
    show: boolean,
    showText?: boolean
    text?: string
    classes?: string
}

export class LoadingSpinner extends React.Component<LoadingSpinnerProps, {}> {

    public static defaultProps: Partial<LoadingSpinnerProps> = {
        text: 'Sending...',
        showText: true
    }

    constructor(props: any) {
        super(props)
    }

    render() {
        return (
            <div className={classnames((this.props.classes ? this.props.classes + ' ' : '') + 'shadowBlock',{ active: this.props.show })}>
                    {this.props.showText ? this.props.text : ''}
                    <div className="preloader" />
            </div>
        )
    }
}
