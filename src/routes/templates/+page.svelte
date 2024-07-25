<script lang="ts">
    import { base } from '$app/paths'
	import { getCookie } from '$lib/helpers/cookies'
    import { onMount } from 'svelte'
    import { PUBLIC_API_URL } from '$env/static/public'
	import { userStore } from '$lib/stores/user'
	import { goto } from '$app/navigation'
    import { AlertCircleIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, SearchIcon } from 'lucide-svelte'
    import * as m from "$lib/paraglide/messages"

    let accessToken = ""
    let templates: Template[]
    let loaded = false
    let API_URL = PUBLIC_API_URL
    let user: User
    let languages = ["PT", "EN", "ES", "FR", "PL"]
    let currentLang = "PT"
    let currentPage = 1
    let pageSize = 5
    let currentInput = ""
    let timeoutId: any
    let totalTemplates = 0
    let firstElement = 0
    let lastElement = 0
    let createButton = false

    async function loadTemplates() {
        let response = await fetch(`${API_URL}/SmartSurvey/Templates?page=${currentPage}&pageSize=${pageSize}&language=${currentLang}&name=${currentInput}`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        if (response.ok) {
            let responseJson = await response.json()
            templates = responseJson.data
            totalTemplates = responseJson.totalCount
        } else { console.log("Can't get templates") }
    }

    function changePage(change: string) {
        if (change === 'increment' && currentPage < Math.ceil(totalTemplates / pageSize)) currentPage++
        else if (change === 'decrement' && currentPage > 1) currentPage--
        loadTemplates()
    }

    function createTemplate() { goto(`${base}/templates/createTemplate`) }

    function debounce(func: any, delay: number) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(func, delay)
    }

    function handleInputChanges() {
        debounce(loadTemplates, 1000)
    }

    onMount(async() => {
        const unsubscribe = userStore.subscribe(temp => user = temp)
        unsubscribe()

        accessToken = getCookie("ss_at") ?? ""

        if (user && user.userId && user.userId > 0) {
            const module = user.authorizations.find(temp => temp.moduleType === 'SmartSurvey')
            const window = module?.windowPermissions.find(temp => temp.windowType === 'Templates')
            const permission = window?.permissions.find((temp: any) => temp.permissionType === 'Read')
            const permissionCreate = window?.permissions.find((temp: any) => temp.permissionType === 'Create')

            if (permissionCreate && permissionCreate.hasPermission) createButton = true

            if (permission && !permission.hasPermission) {
                goto(`${base}/`)
            } else {
                await loadTemplates()
                loaded = true
            }
        } else { goto(`${base}/`) }
    })

    $: {
        firstElement = Math.min((currentPage - 1) * pageSize + 1, totalTemplates)
        lastElement = Math.min(currentPage * pageSize, totalTemplates)
    }
</script>

<svelte:head>
    <title>{m.pageTemplates()} - SmartSurvey</title>
</svelte:head>

{#if loaded}
    <div class="flex flex-col gap-y-5 w-full">
        <div class="flex mx-auto p-1 gap-x-1 border border-gray-300 text-gray-500 rounded">
            {#each languages as language}
                <button on:click={() => { if (currentLang != language) { currentLang = language; loadTemplates() }}}
                    class="py-1 px-2 rounded text-sm {language === currentLang ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}"
                >
                    {language}
                </button>
            {/each}
        </div>

        <div class="flex justify-between">
            <h1 class="font-semibold text-2xl">{m.templates()}</h1>
            {#if createButton}
                <button on:click={() => createTemplate()} class="button">
                    <svelte:component this={PlusIcon} />
                    {m.createTemplate()}
                </button>
            {/if}
        </div>

        <div class="flex relative">
            <input
                bind:value={currentInput} on:input={() => { currentPage = 1; handleInputChanges() }}
                class="w-full text-sm px-[50px] py-3 rounded border border-gray-300 bg-gray-200"
                id="searchNameTemplates"
                placeholder={m.searchInputTemplate()}
                type="text"
            />
            <div class="absolute flex items-center inset-y-0 left-0 px-[15px] pointer-events-none">
                <svelte:component this={SearchIcon} size={25} />
            </div>
        </div>

        {#if templates.length > 0}
            <div class="flex flex-col gap-y-1">
                {#each templates as template}
                    <a class="flex flex-col gap-y-1 p-2 h-20 cursor-pointer rounded hover:bg-gray-200" href="/">
                        <p class="font-medium">{template.translations[0].title}</p>
                        <p class="text-xs line-clamp-2 text-gray-400">{template.translations[0].description}</p>
                    </a>
                {/each}
            </div>

            {#if templates.length > 5}
                <div class="flex justify-between">
                    <button on:click={() => { if (currentPage != 1) changePage('decrement') }} class="rounded border border-gray-300 hover:bg-gray-200">
                        <svelte:component this={ChevronLeftIcon} />
                    </button>
                    <button on:click={() => { if (lastElement != totalTemplates) changePage('increment') }} class="rounded border border-gray-300 hover:bg-gray-200">
                        <svelte:component this={ChevronRightIcon} />
                    </button>
                </div>
            {/if}
        {:else}
            <div class="flex flex-col gap-y-2 items-center justify-center">
                <svelte:component this={AlertCircleIcon} size={50} strokeWidth={1.5} />
                <p>{m.emptyListTemplates()}</p>
            </div>
        {/if}
    </div>
{/if}