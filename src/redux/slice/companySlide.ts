import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchCompany } from '@/config/api';
import { ICompany } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: ICompany[]
}
// First, create the thunk
export const fetchCompany = createAsyncThunk(
    'company/fetchCompany',
    async ({ query }: { query: string }) => {
        const response = await callFetchCompany(query);
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


export const companySlide = createSlice({
    name: 'company',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        setActiveMenu: (state, action) => {
            // state.activeMenu = action.payload;
        },
        // ✅ FIX: Reset về page 1 khi vào trang Company
        resetCompanyPage: (state) => {
            state.meta.page = 1;
        },
        // ✅ FIX: Update page ngay lập tức khi user click pagination
        setCompanyPage: (state, action) => {
            state.meta.page = action.payload.page;
            state.meta.pageSize = action.payload.pageSize;
        },

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchCompany.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchCompany.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchCompany.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                // ✅ FIX: Chỉ update pages và total, KHÔNG overwrite page/pageSize
                // Vì page/pageSize đã được set bởi setCompanyPage() trước đó
                state.meta.pages = action.payload.data.meta.pages;
                state.meta.total = action.payload.data.meta.total;
                state.result = action.payload.data.result;
            }
        })
    },

});

export const {
    setActiveMenu,
    resetCompanyPage,
    setCompanyPage,
} = companySlide.actions;

export default companySlide.reducer;
