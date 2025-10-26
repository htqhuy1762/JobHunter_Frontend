import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchPermission } from '@/config/api';
import { IPermission } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IPermission[]
}
// First, create the thunk
export const fetchPermission = createAsyncThunk(
    'permission/fetchPermission',
    async ({ query }: { query: string }) => {
        const response = await callFetchPermission(query);
        return response;
    }
)


const initialState: IState = {
    isFetching: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: []
};


export const permissionSlide = createSlice({
    name: 'permission',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        resetPermissionPage: (state) => {
            state.meta.page = 1;
        },
        setPermissionPage: (state, action) => {
            state.meta.page = action.payload.page;
            state.meta.pageSize = action.payload.pageSize;
        },

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchPermission.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchPermission.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchPermission.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta.pages = action.payload.data.meta.pages;
                state.meta.total = action.payload.data.meta.total;
                state.result = action.payload.data.result;
            }
        })
    },

});

export const {
    resetPermissionPage,
    setPermissionPage,
} = permissionSlide.actions;

export default permissionSlide.reducer;
