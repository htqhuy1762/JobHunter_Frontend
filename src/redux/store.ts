import {
  Action,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';
import accountReducer from './slice/accountSlide';

// ⚡ TanStack Query đã thay thế Redux cho server data
// Chỉ giữ accountReducer cho authentication state

export const store = configureStore({
  reducer: {
    account: accountReducer,
    // ❌ Removed: company, user, job, resume, permission, role, skill
    // ✅ Những state này giờ được manage bởi TanStack Query
  },
});


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;