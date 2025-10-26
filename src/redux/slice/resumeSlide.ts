import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchJob, callFetchResume } from '@/config/api';
import { IResume } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IResume[]
}
// First, create the thunk
export const fetchResume = createAsyncThunk(
    'resume/fetchResume',
    async ({ query }: { query: string }) => {
        const response = await callFetchResume(query);
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


export const resumeSlide = createSlice({
    name: 'resume',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
        resetResumePage: (state) => {
            state.meta.page = 1;
        },
        setResumePage: (state, action) => {
            state.meta.page = action.payload.page;
            state.meta.pageSize = action.payload.pageSize;
        },

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchResume.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchResume.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchResume.fulfilled, (state, action) => {
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
    resetResumePage,
    setResumePage,
} = resumeSlide.actions;

export default resumeSlide.reducer;
