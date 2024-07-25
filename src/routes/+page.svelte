<script lang="ts">
    import { base } from "$app/paths"
    import { goto } from "$app/navigation"
    import { onMount } from "svelte"
    import { userStore } from "$lib/stores/user"
	import { getCookie } from "$lib/helpers/cookies"
    import { ClipboardIcon, LayoutTemplateIcon } from "lucide-svelte"
    import * as m from "$lib/paraglide/messages"

    let accessToken = ""
    let loaded = false
    let user: User
    let totalSurveys = 0
    let totalTemplates = 0

    async function loadObjects(object: string) {
        let response = await fetch(`http://localhost:9003/api/v1/SmartSurvey/${object}?page=1&pageSize=1`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        if (response.ok) {
            let responseJson = await response.json()
            return responseJson.totalCount
        } else { console.log(`Can't get ${object}`) }
    }

    onMount(async () => {
        const unsubscribe = userStore.subscribe(temp => user = temp)
        unsubscribe()

        accessToken = getCookie('ss_at') ?? ""

        if (user && user.profileType === 'Backoffice') {
            totalTemplates = await loadObjects('Templates')
            totalSurveys = await loadObjects('Surveys')
            loaded = true
        } else if (user && user.profileType === 'Frontoffice') {
            loaded = true
        } else { goto(`${base}/`) }
    })
</script>

<svelte:head>
    <title>{m.pageHome()} - SmartSurvey</title>
</svelte:head>

{#if loaded}
    <div class="flex flex-col mx-auto gap-y-5">
        {#if user.profileType === 'Backoffice'}
            <div class="flex gap-x-5">
                <div class="relative w-40 h-20 rounded border border-gray-300 bg-gray-200 text-gray-500">
                    <svelte:component this={LayoutTemplateIcon} class="absolute top-0 left-0 m-2" size={30} />
                    <p class="absolute bottom-0 left-0 m-2 text-xs">{m.templates()}</p>
                    <p class="absolute bottom-0 right-0 m-2 text-4xl">{totalTemplates}</p>
                </div>
                <div class="relative w-40 h-20 rounded border border-gray-300 bg-gray-200 text-gray-500">
                    <svelte:component this={ClipboardIcon} class="absolute top-0 left-0 m-2" size={30} />
                    <p class="absolute bottom-0 left-0 m-2 text-xs">{m.surveys()}</p>
                    <p class="absolute bottom-0 right-0 m-2 text-4xl">{totalSurveys}</p>
                </div>
            </div>
        {:else if user.profileType === 'Frontoffice'}
            <p>Frontoffice</p>
        {/if}
    </div>
{/if}