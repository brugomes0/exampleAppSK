<script lang="ts">
    import { base } from "$app/paths"
    import { getCookie } from "$lib/helpers/cookies"
    import { onMount } from "svelte"
    import { PUBLIC_API_URL } from "$env/static/public"
	import { userStore } from "$lib/stores/user"
	import { goto } from "$app/navigation"
    import { AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from 'lucide-svelte'
    import * as m from "$lib/paraglide/messages"

    let accessToken = ""    // save accessToken
    let surveys: Survey[]    // save surveys data
    let loaded = false  // check if page can be loaded
    let API_URL = PUBLIC_API_URL    // base url from the api
    let user: User  // save user data
    let currentStatus = "Active"    // current status in page to see surveys
    let languages = ["PT", "EN", "ES", "FR", "PL"]  // languages possible
    let currentLang = "PT"  // current language being used for surveys
    let currentInput = ""   // input in search bar for filter surveys
    let currentPage = 1 // page of surveys in browser
    let timeoutId: any 
    let pageSize = 5    // how many surveys in one size
    let totalSurveys = 0    // total number of surveys
    let firstElement = 0    // first element of surveys
    let lastElement = 0 // last element of surveys
    let createButton = false    // check if user has permission to create survey

    async function loadSurveys() {
        let response = await fetch(`${API_URL}/SmartSurvey/Surveys?page=${currentPage}&pageSize=${pageSize}&language=${currentLang}&name=${currentInput}&status=${currentStatus}`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        if (response.ok) {
            let responseJson = await response.json()
            surveys = responseJson.data
            totalSurveys = responseJson.totalCount
        } else { console.log("Can't get surveys") }
    }

    function changePage(change: string) {
        if (change === 'increment' && currentPage < Math.ceil(totalSurveys / pageSize)) currentPage++
        else if (change === 'decrement' && currentPage > 1) currentPage--
        loadSurveys()
    }

    function createSurvey() { goto(`${base}/surveys/createSurvey`) }

    function debounce(func: any, delay: number) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(func, delay)
    }

    function handleInputChanges() {
        debounce(loadSurveys, 1000)
    }

    onMount(async () => {
        const unsubscribe = userStore.subscribe((temp: any) => { user = temp })
        unsubscribe()

        accessToken = getCookie("ss_at") ?? ""

        if (user && user.userId && user.userId > 0) {
            const module = user.authorizations.find(temp => temp.moduleType === 'SmartSurvey')
            const window = module?.windowPermissions.find(temp => temp.windowType === 'Surveys')
            const permission = window?.permissions.find(temp => temp.permissionType === 'Read')
            const permissionCreate = window?.permissions.find(temp => temp.permissionType === 'Create')

            if (permissionCreate && permissionCreate.hasPermission) createButton = true

            if (permission && !permission.hasPermission) {
                goto(`${base}/`)
            } else {
                await loadSurveys()
                loaded = true
            }
        } else { goto(`${base}/`) }
    })

    $: {
        firstElement = Math.min((currentPage - 1) * pageSize + 1, totalSurveys)
        lastElement = Math.min(currentPage * pageSize, totalSurveys)
    }
</script>

<svelte:head>
    <title>{m.pageSurveys()} - SmartSurvey</title>
</svelte:head>

{#if loaded}
    <div class="flex flex-col gap-y-5 w-full">
        <div class="flex mx-auto p-1 gap-x-1 border border-gray-300 text-gray-500 rounded">
            {#each languages as language}
                <button
                    on:click={() => { if (currentLang != language) { currentLang = language; loadSurveys() }}}
                    class="py-1 px-2 rounded text-sm {language === currentLang ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}"
                >
                    {language}
                </button>
            {/each}
        </div>

        <div class="flex justify-between">
            <h1 class="font-semibold text-2xl">{m.surveys()}</h1>
            {#if createButton}
                <button on:click={() => createSurvey()} class="button">
                    <svelte:component this={PlusIcon} />
                    {m.createSurvey()}
                </button>
            {/if}
        </div>

        <div class="flex relative">
            <input
                bind:value={currentInput} on:input={() => { currentPage = 1; handleInputChanges() }}
                class="w-full text-sm px-[50px] py-3 rounded border border-gray-300 bg-gray-200"
                id="searchNameSurveys"
                placeholder={m.searchInputSurvey()}
                type="text"
            />
            <div class="absolute flex items-center inset-y-0 left-0 px-[15px] pointer-events-none">
                <svelte:component this={SearchIcon} size={25} />
            </div>
        </div>
        
        <div class="flex gap-x-2">
            <button on:click={() => { currentStatus = "Active"; currentPage = 1; loadSurveys()}} class="flex items-center justify-center px-2 py-1 border-b-2 {currentStatus === "Active" ? 'border-blue-500' : 'border-transparent'}">{m.surveyStatusActive()}</button>
            <button on:click={() => { currentStatus = "NotStarted"; currentPage = 1; loadSurveys()}} class="flex items-center justify-center px-2 py-1 border-b-2 {currentStatus === "NotStarted" ? 'border-blue-500' : 'border-transparent'}">{m.surveyStatusNotStarted()}</button>
            <button on:click={() => { currentStatus = "Inactive"; currentPage = 1; loadSurveys()}} class="flex items-center justify-center px-2 py-1 border-b-2 {currentStatus === "Inactive" ? 'border-blue-500' : 'border-transparent'}">{m.surveyStatusInactive()}</button>
            <button on:click={() => { currentStatus = "Completed"; currentPage = 1; loadSurveys()}} class="flex items-center justify-center px-2 py-1 border-b-2 {currentStatus === "Completed" ? 'border-blue-500' : 'border-transparent'}">{m.surveyStatusCompleted()}</button>
        </div>

        {#if surveys.length > 0}
            <div class="flex flex-col gap-y-1">
                {#each surveys as survey}
                    <a class="flex flex-col gap-y-1 p-2 h-20 cursor-pointer rounded hover:bg-gray-200" href={`${base}/surveys/${survey.surveyId}`}>
                        <p class="font-medium">{survey.translations[0].title}</p>
                        <p class="text-xs line-clamp-2 text-gray-400">{survey.translations[0].description}</p>
                    </a>
                {/each}
            </div>

            {#if surveys.length > 5}
                <div class="flex justify-between">
                    <button on:click={() => { if (currentPage != 1) changePage('decrement') }} class="rounded border border-gray-300 hover:bg-gray-200">
                        <svelte:component this={ChevronLeftIcon} />
                    </button>
                    <button on:click={() => { if (lastElement != totalSurveys) changePage('increment') }} class="rounded border border-gray-300 hover:bg-gray-200">
                        <svelte:component this={ChevronRightIcon} />
                    </button>
                </div>
            {/if}
        {:else}
            <div class="flex flex-col gap-y-2 items-center justify-center">
                <svelte:component this={AlertCircleIcon} size={50} strokeWidth={1.5} />
                <p>{m.emptyListSurveys()}</p>
            </div>
        {/if}
    </div>
{/if}