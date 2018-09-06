import * as React from 'react'
import { RolodexPicker, RolodexData } from './rolodex'
import * as moment from 'moment'

import '../styles/components/RolodexDatePicker.scss'
import { StringResources } from '../resources/stringResources'
import { Strings } from '../resources/strings'
import { Masker } from '../utils/masker/Masker'

interface RolodexDatePickerProps {
    value?: moment.Moment
    openToDate?: moment.Moment
    minDate?: moment.Moment
    maxDate?: moment.Moment
    onChange?: (value: moment.Moment | null) => void
    placeholder?: string
    format?: string
    valueRender?: (value: moment.Moment) => string
    valueParser?: (value: string) => moment.Moment
    showOk?: boolean
    showCancel?: boolean
    readonly?: boolean
	className?: string
	mask?: string
}

interface RolodexDatePickerState {
    picker?: RolodexPicker
    inputValue?: string
    prevValue?: moment.Moment
}

interface RolodexDatePickerValues {
    day: RolodexData<number>
    month: RolodexData<number>
    year: RolodexData<number>
}

const defaultFormat = 'MM/DD/YYYY'
const defaultMask = 'xx/xx/xxxx'

export class RolodexDatePicker extends React.Component<RolodexDatePickerProps, RolodexDatePickerState> {

    static defaultProps: Partial<RolodexDatePickerProps> = {
        openToDate: moment(),
        minDate: moment('01-01-1900','DD-MM-YYYY'),
        maxDate: moment('31-12-2900', 'DD-MM-YYYY'),
        showCancel: true,
        showOk: true,
        readonly: true
	}

	private masker: Masker

    constructor(props: any) {
        super(props)
		this.state = {}
		this.masker = new Masker(this.props.mask ? this.props.mask : defaultMask, Masker.placeSymbol)
    }

    private prepareState = () => {
        let currentDate = this.getCurrentValue()
        let minDate = this.props.minDate ? this.props.minDate : moment()
        let maxDate = this.props.maxDate ? this.props.maxDate : moment()

        let currentYear = currentDate.year()
        let maxYear = maxDate.year()
        let minYear = minDate.year()

        let currentMonth = currentDate.month() + 1
        let maxMonth = maxDate.month() + 1
        let minMonth = minDate.month() + 1

        let currentDay = currentDate.date()
        let hasNextDay = /*(currentYear === maxYear && currentMonth === maxMonth) ? (currentDay < maxDate.date()) :*/ (currentDay < currentDate.daysInMonth())
        let hasPrevDay = /*(currentYear === minYear && currentMonth === minMonth) ? (currentDay > minDate.date()) :*/ (currentDay > 1)

        let day: RolodexData<number> = {
            currentValue: currentDay,
            hasNext: hasNextDay,
            hasPrev: hasPrevDay,
            render: this.dayRender,
            nextValue: hasNextDay ? (currentDay + 1) : undefined,
            prevValue: hasPrevDay ? (currentDay - 1) : undefined,
            moveNext: this.nextDay,
            movePrev: this.prevDay
        }

        let hasNextMonth = /*(currentYear === maxYear) ? (currentMonth < maxMonth) :*/ currentMonth < 12
        let hasPrevMonth = /*(currentYear === minYear) ? (currentMonth > minMonth) :*/ currentMonth > 1

        let month: RolodexData<number> = {
            currentValue: currentMonth,
            hasNext: hasNextMonth,
            hasPrev: hasPrevMonth,
            render: this.monthRender,
            nextValue: hasNextMonth ? (currentMonth + 1) : undefined,
            prevValue: hasPrevMonth ? (currentMonth - 1) : undefined,
            moveNext: this.nextMonth,
            movePrev: this.prevMonth
        }

        let year: RolodexData<number> = {
            currentValue: currentYear,
            hasNext: currentYear < maxYear,
            hasPrev: currentYear > minYear,
            render: this.yearRender,
            nextValue: (currentYear < maxYear) ? (currentYear + 1) : undefined,
            prevValue: (currentYear > minYear) ? (currentYear - 1) : undefined,
            moveNext: this.nextYear,
            movePrev: this.prevYear
        }

        let result: RolodexDatePickerValues = {
            day: day,
            month: month,
            year: year
        }
        return result
    }

    private getCurrentValue = () => {
		let openToDate = this.props.openToDate ? this.props.openToDate : moment()
		openToDate = this.props.minDate && this.props.minDate.valueOf() > openToDate.valueOf() ? this.props.minDate : openToDate
		openToDate = this.props.maxDate && this.props.maxDate.valueOf() < openToDate.valueOf() ? this.props.maxDate : openToDate
        let currentDate = this.props.value ? this.props.value : openToDate
        // currentDate = this.props.minDate && this.props.minDate.valueOf() > currentDate.valueOf() ? this.props.minDate : currentDate
        // currentDate = this.props.maxDate && this.props.maxDate.valueOf() < currentDate.valueOf() ? this.props.maxDate : currentDate
        return currentDate
    }

    private changeDate = (change: (currentDate: moment.Moment) => moment.Moment) => {
        return () => {
            if (this.props.onChange) {
                let currentDate = moment(this.getCurrentValue())
                let newValue = change(currentDate)
                this.setState({
                    inputValue: undefined
                })
                this.props.onChange(newValue)
            }
        }
    }

    nextDay = this.changeDate((currentDate) => currentDate.day(currentDate.day() + 1))

    prevDay = this.changeDate((currentDate) => currentDate.day(currentDate.day() - 1))

    nextMonth = this.changeDate((currentDate) => currentDate.month(currentDate.month() + 1))

    prevMonth = this.changeDate((currentDate) => currentDate.month(currentDate.month() - 1))

    nextYear = this.changeDate((currentDate) => currentDate.year(currentDate.year() + 1))

    prevYear = this.changeDate((currentDate) => currentDate.year(currentDate.year() - 1))

    dayRender = (value: number) => {
        return (<span>{value}</span>)
    }

    monthRender = (value: number) => {
        return (<span>{moment.monthsShort(value - 1)}</span>)
    }

    yearRender = (value: number) => {
        return (<span>{value}</span>)
    }

    registerRolodex = (picker?: RolodexPicker) => {
        this.setState({
            picker: picker
        })
    }

    onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!this.props.readonly && this.state.inputValue !== e.target.value) {
            let value: moment.Moment | null
            let minDate = this.props.minDate ? this.props.minDate : moment()
            let maxDate = this.props.maxDate ? this.props.maxDate : moment()
            if (!this.props.valueRender) {
                value = moment(e.target.value as string, this.props.format ? this.props.format : defaultFormat)
                if (!value.isValid()) {
                    value = null
                }
            } else if (this.props.valueParser) {
                value = this.props.valueParser(e.target.value)
            } else {
                value = null
            }
            if (value) {
                if (value.valueOf() < minDate.valueOf() || value.valueOf() > maxDate.valueOf()) {
                    value = null
                }
            }
            if (this.props.onChange) {
                this.props.onChange(value)
            }
            this.setState({
                inputValue: this.masker.mask(this.masker.unmask(e.target.value))
            })
        }
    }

    footerRender = () => {
        let onOk = () => {
            if (this.state.picker) {
                this.state.picker.hide()
            }

        }
        let onCancel = () => {
            if (this.state.picker) {
                this.state.picker.hide()
            }
            if (this.props.onChange) {
                this.props.onChange(this.state.prevValue ? this.state.prevValue : null)
            }
            this.setState({
                inputValue: this.state.prevValue ? (this.props.valueRender ? this.props.valueRender : this.defaultRender)(this.state.prevValue) : undefined,
                prevValue: undefined
            })
        }
        return (
            <div className="rolodex-date-picker__button-container">
                {this.props.showCancel &&
                    <button
                        type="button"
                        className="btn black btn-cancel"
                        onClick={onCancel}
                    >
                        {StringResources.getString(Strings.Components.RolodexDatePicker.Buttons.Cancel.title)}
                    </button>
                }
                {this.props.showOk &&
                    <button
                        type="button"
                        className="btn black btn-ok"
                        onClick={onOk}
                    >
                        {StringResources.getString(Strings.Components.RolodexDatePicker.Buttons.Ok.title)}
                    </button>
                }
            </div>
        )
    }

    headerRender = () => {
        return (
            <div className="rolodex-date-picker__header">
                <span>{StringResources.getString(Strings.Components.RolodexDatePicker.SelectedValueTitle, this.props.value ? (this.props.valueRender ? this.props.valueRender : this.defaultRender)(this.props.value) : '')}</span>
            </div>
        )
    }

    onPopupOpen = () => {
        this.setState({
            prevValue: this.props.value
        })
        if (this.props.onChange) {
            this.props.onChange(this.getCurrentValue())
        }
    }

    private defaultRender = (value: moment.Moment) => {
        let format = this.props.format ? this.props.format : defaultFormat
        return value.format(format)
    }

    render() {
        let pseudoState = this.prepareState()
        return (
            <RolodexPicker
                className={this.props.className}
                showFooter={true}
                footerRender={this.footerRender}
                showHeader={true}
                headerRender={this.headerRender}
                data={[pseudoState.day, pseudoState.month, pseudoState.year]}
                placeholder={this.props.placeholder}
                value={this.state.inputValue ? this.state.inputValue : (this.props.value ? (this.props.valueRender ? this.props.valueRender : this.defaultRender)(this.props.value) : '')}
                onRef={this.registerRolodex}
                onOpen={this.onPopupOpen}
                readonly={this.props.readonly}
                onInputChange={this.onInputChange}
            />
        )
    }
}
