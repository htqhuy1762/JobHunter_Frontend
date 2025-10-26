import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchJob } from '@/config/api';
import { IJob } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IJob[]
}
// First, create the thunk
export const fetchJob = createAsyncThunk(
    'job/fetchJob',
    async ({ query }: { query: string }) => {
        const response = await callFetchJob(query);
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


export const jobSlide = createSlice({
    name: 'job',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
        resetJobPage: (state) => {
            state.meta.page = 1;
        },
        setJobPage: (state, action) => {
            state.meta.page = action.payload.page;
            state.meta.pageSize = action.payload.pageSize;
        },

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchJob.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchJob.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchJob.fulfilled, (state, action) => {
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
    setActiveMenu,
    resetJobPage,
    setJobPage,
} = jobSlide.actions;

export default jobSlide.reducer;
