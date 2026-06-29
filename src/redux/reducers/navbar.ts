import { createSlice } from '@reduxjs/toolkit';

interface NavbarState {
  isExpanded: boolean;
}

const initialState: NavbarState = {
  isExpanded: true,
};

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    toggleNavbar: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    setNavbarExpanded: (state, action: { payload: boolean }) => {
      state.isExpanded = action.payload;
    },
  },
});

export const { toggleNavbar, setNavbarExpanded } = navbarSlice.actions;
export default navbarSlice.reducer;
