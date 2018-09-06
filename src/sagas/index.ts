import { SagaIterator } from 'redux-saga'
import { takeLatest, all } from 'redux-saga/effects'

export function* rootSagas(): SagaIterator {
    console.log('hello sagas')
}
