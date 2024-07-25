<script lang="ts">
    import { base } from "$app/paths"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte"
    import { userStore } from "$lib/stores/user"
	import { AlertCircleIcon } from "lucide-svelte";
	import { PUBLIC_API_URL } from "$env/static/public";
	import { getCookie } from "$lib/helpers/cookies";
    import * as m from "$lib/paraglide/messages"

    let API_URL = PUBLIC_API_URL
    let accessToken = ""
    let user: User
    let loaded = false
    let createButton = false
    let page = 1
    let surveys: Survey[] = []
    let surveysPage = 1
    let surveysPageSize = 5
    let selectedSurvey = undefined

    async function loadSurveys() {
        let response = await fetch(`${API_URL}/SmartSurvey/Surveys?page=${surveysPage}&pageSize=${surveysPageSize}&status=Completed`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        if (response.ok) {
            let responseJson = await response.json()
            surveys = responseJson.data
        } else { console.log("Failed to fetch surveys", response.status, response.statusText) }
    }

    onMount(async () => {
        const unsubscribe = userStore.subscribe((temp: any) => { user = temp })
        unsubscribe()

        accessToken = getCookie("ss_at") ?? ""

        if (user && user.userId && user.userId > 0) {
            const module = user.authorizations.find((temp: any) => temp.moduleType === 'SmartSurvey')
            const window = module?.windowPermissions.find((temp: any) => temp.windowType === 'Statistics')
            const permission = window?.permissions.find((temp: any) => temp.permissionType === 'Read')
            const permissionCreate = window?.permissions.find((temp: any) => temp.permissionType === 'Create')

            if (permissionCreate && permissionCreate.hasPermission) createButton = true

            if (permission && !permission.hasPermission) {
                goto(`${base}/`)
            } else {
                await loadSurveys()
                loaded = true
            }
        } else { goto(`${base}/`) }
    })
</script>

<svelte:head>
    <title>{m.pageStatistics()} - SmartSurvey</title>
</svelte:head>

{#if loaded}
    <div class="flex flex-col gap-y-5 w-full">
        <h1 class="font-semibold text-2xl">{m.statistics()}</h1>
        {#if page == 1}
            {#if surveys.length > 0}
                <div class="flex flex-col">
                    <p class="font-medium">{m.selectSurvey()}</p>
                    <p class="text-xs text-gray-400">{m.selectSurveyText()}</p>
                </div>

                <div class="flex flex-col gap-y-1">
                    <div class="flex flex-col max-h-[350px] shadow rounded overflow-y-auto border border-gray-300">
                        {#each surveys as survey, index}
                            <label
                                class="flex gap-x-5 px-5 py-[10px] cursor-pointer hover:bg-gray-200 {surveys.length === index + 1 ? '' : 'border-b border-gray-300'}"
                                for={survey.surveyId}
                            >
                                <input bind:group={selectedSurvey} class="cursor-pointer" id={survey.surveyId} type="radio" value={survey} />
                                <div class="flex flex-col overflow-hidden">
                                    <span>{survey.translations[0].title}</span>
                                    <span class="text-xs h-[40px] text-gray-400 line-clamp-2">{survey.translations[0].description}</span>
                                </div>
                            </label>
                        {/each}
                    </div>
                </div>

                <div class="flex justify-center">
                    <button class="button">{m.continueLabel()}</button>
                </div>
            {:else}
                <div class="flex flex-col items-center justify-center gap-y-1">
                    <svelte:component this={AlertCircleIcon} size={50} strokeWidth={1.5} />
                    <p>No surveys available</p>
                </div>
            {/if}
        {/if}
    </div>
{/if}