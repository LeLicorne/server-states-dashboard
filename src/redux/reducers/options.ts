import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ModeType } from '@/hooks/useDarkMode';

interface OptionsState {
  mode: ModeType;
}

const initialState: OptionsState = {
  mode: 'auto',
};

const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<ModeType>) {
      state.mode = action.payload;
    },
  },
});

export const { setMode } = optionsSlice.actions;

export default optionsSlice.reducer;
