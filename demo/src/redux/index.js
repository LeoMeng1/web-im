import { createStore, applyMiddleware, compose, combineReducers } from "redux"
import config from "@/config"
import { forEach } from "lodash"
import thunkMiddleware from "redux-thunk"

// todo media query pollyfill
import { breakpointReducer, combinedReducer, MATCH_MEDIA } from "./indexRedux"

/* ------------- Redux Dev Tools ------------- */

const composeEnhancers =
	typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
		: compose

const enhancers = []

const middlewares = [thunkMiddleware]

enhancers.push(applyMiddleware(...middlewares))

/* ------------- Assemble The Reducers ------------- */
const rootReducer = combineReducers({
	breakpoint: breakpointReducer
	// entities: combineReducers({
	//   roster: require('./RosterRedux').reducer,
	//   group: require('./GroupRedux').reducer,
	//   groupMember: require('./GroupMemberRedux').reducer,
	//   subscribe: require('./SubscribeRedux').reducer,
	//   blacklist: require('./BlacklistRedux').reducer,
	//   message: require('./MessageRedux').reducer,
	// }),
	// ui: combineReducers({
	//   common: require('./CommonRedux').reducer,
	//   login: require('./LoginRedux').reducer,
	//   contacts: require('./ContactsScreenRedux').reducer,
	// }),
	// im: require('./WebIMRedux').reducer
})

/* ------------- Global Reducers ------------- */
const appReducer = (state = initState, action) => {
	const newState = combinedReducer(state, action)
	return rootReducer(newState, action)
}

const initState = {
	breakpoint: {}
}

/* ------------- Enhancers ------------- */

export const store = createStore(appReducer, composeEnhancers(...enhancers))

// store.subscribe(() => console.log(store.getState()))

/* ------------- Media Query ------------- */
// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
if (typeof window !== "undefined") {
	const matchMediaPolyfill = mediaQuery => {
		return {
			media: mediaQuery,
			matches: false,
			addListener() {},
			removeListener() {}
		}
	}
	window.matchMedia = window.matchMedia || matchMediaPolyfill
}

if (config.reduxMatchMedia) {
	let matchMedia
	if (typeof window !== "undefined") {
		matchMedia = window.matchMedia
	}
	let mql = []
	forEach(config.dimensionMap, (px, k) => {
		mql[k] = matchMedia(`(max-width: ${px})`)
		mql[k].addListener(e => {
			// console.log("mql", k, e)
			store.dispatch({
				type: MATCH_MEDIA,
				k,
				v: e
			})
		})
		// default init
		console.log(k, mql[k])
		store.dispatch({
			type: MATCH_MEDIA,
			k,
			v: mql[k]
		})
	})
}

export default {
	store
}
