import { combineReducers } from 'redux'
import { REPLACE_PAGE, REPLACE_ITEM, START_LOADING, FINISH_LOADING } from './actions'
import {load} from './local'

const initialState = {
  connectedItems: {},
  entities: load('hn_state') || {
    byIds: {
      topstories: [],
      beststories: [],
      newstories: []
    },
    items: {}
  },
  ui: {
    topstories: {
      isLoading: false
    },
    beststories: {
      isLoading: false
    },
    newstories: {
      isLoading: false
    },
    topic: {
      isLoading: false
    }
  }
}

function connectedItems (state = {}, action) {
  switch (action.type) {
    case REPLACE_PAGE:
      return {
        ...state,
        [action.page]: action.page
      }
    case REPLACE_ITEM:
      return {
        ...state,
        [`item/${action.item.id}`]: `item/${action.item.id}`
      }
    default:
      return state 
  }
}

function byIds (state = initialState.entities.byIds, action) {
  switch (action.type) {
    case REPLACE_PAGE:
      return {
        ...state,
        [action.page]: action.items
      }
    default:
      return state 
  }
}

function items (state = initialState.entities.items, action) {
  switch (action.type) {
    case REPLACE_ITEM:
      return {
        ...state,
        [action.item.id]: action.item
      }
    default:
      return state
  }
}

function ui (state = initialState.ui, action) {
  switch (action.type) {
    case START_LOADING:
      return {
        ...state,
        [action.page]: {
          isLoading: true
        }
      }
    case FINISH_LOADING:
      return {
        ...state,
        [action.page]: {
          isLoading: false
        }
      }
    default:
      return state
  }
}

const entities = combineReducers({items, byIds})
export default combineReducers({entities, ui, connectedItems})
