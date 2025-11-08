import { combineReducers } from '@reduxjs/toolkit';

import authReducer from './reducers/auth';
import navbarReducer from './reducers/navbar';
import optionsReducer from './reducers/options';
import { apiSlice } from './services/api';

const rootReducers = combineReducers({
  options: optionsReducer,
  auth: authReducer,
  navbar: navbarReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export default rootReducers;
