import { writable } from "svelte/store"

const userTemplate: User = {
    userId: 0,
    employeeId: 0,
    userName: "",
    userEmail: "",
    profileDescription: "",
    profileType: "",
    authorizations: []
}

export const userStore = writable(userTemplate)