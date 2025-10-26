import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { callFetchRole, callFetchRoleById } from '@/config/api';
import { IRole } from '@/types/backend';

interface IState {
    isFetching: boolean;
    meta: {
        page: number;
        pageSize: number;
        pages: number;
        total: number;
    },
    result: IRole[];
    isFetchSingle: boolean;
    singleRole: IRole
}
// First, create the thunk
export const fetchRole = createAsyncThunk(
    'resume/fetchRole',
    async ({ query }: { query: string }) => {
        const response = await callFetchRole(query);
        return response;
    }
)

export const fetchRoleById = createAsyncThunk(
    'resume/fetchRoleById',
    async (id: string) => {
        const response = await callFetchRoleById(id);
        return response;
    }
)


const initialState: IState = {
    isFetching: true,
    isFetchSingle: true,
    meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0
    },
    result: [],
    singleRole: {
        id: "",
        name: "",
        description: "",
        active: false,
        permissions: []
    }
};


export const roleSlide = createSlice({
    name: 'role',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {

        resetSingleRole: (state, action) => {
            state.singleRole = {
                id: "",
                name: "",
                description: "",
                active: false,
                permissions: []
            }
        },
        resetRolePage: (state) => {
            state.meta.page = 1;
        },
        setRolePage: (state, action) => {
            state.meta.page = action.payload.page;
            state.meta.pageSize = action.payload.pageSize;
        },

    },
    extraReducers: (builder) => {
        // Add reducers for additional action types here, and handle loading state as needed
        builder.addCase(fetchRole.pending, (state, action) => {
            state.isFetching = true;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchRole.rejected, (state, action) => {
            state.isFetching = false;
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchRole.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetching = false;
                state.meta.pages = action.payload.data.meta.pages;
                state.meta.total = action.payload.data.meta.total;
                state.result = action.payload.data.result;
            }
        })

        builder.addCase(fetchRoleById.pending, (state, action) => {
            state.isFetchSingle = true;
            state.singleRole = {
                id: "",
                name: "",
                description: "",
                active: false,
                permissions: []
            }
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchRoleById.rejected, (state, action) => {
            state.isFetchSingle = false;
            state.singleRole = {
                id: "",
                name: "",
                description: "",
                active: false,
                permissions: []
            }
            // Add user to the state array
            // state.courseOrder = action.payload;
        })

        builder.addCase(fetchRoleById.fulfilled, (state, action) => {
            if (action.payload && action.payload.data) {
                state.isFetchSingle = false;
                state.singleRole = action.payload.data;
            }
        })
    },

});

export const {
    resetSingleRole,
    resetRolePage,
    setRolePage,
} = roleSlide.actions;

export default roleSlide.reducer;
