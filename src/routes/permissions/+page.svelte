<script lang="ts">
    import { base } from "$app/paths"
	import { goto } from "$app/navigation"
	import { getCookie } from "$lib/helpers/cookies"
	import { onMount } from "svelte"
    import { PUBLIC_API_URL } from "$env/static/public"
	import { userStore } from "$lib/stores/user"
    import * as m from "$lib/paraglide/messages"

    let accessToken = ""
    let loaded = false
    let profiles: Profile[]
    let profileChoosedId: any
    let profilePermissions: any
    let API_URL = PUBLIC_API_URL
    let user: User

    async function getPermissionsOfProfile() {
        let response = await fetch(`${API_URL}/Admin/${profileChoosedId}/Permissions?module=SmartSurvey`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        if (response.ok) {
            let responseJson = await response.json()
            let responseModules = responseJson.data
            profilePermissions = responseModules.find((m: any) => m.moduleType === 'SmartSurvey')
        } else { console.log("Can't fetch permissions of given profile", response.status, response.statusText) }
    }

    async function getProfiles() {
        let response = await fetch(`${API_URL}/Profiles`, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
        })
        if (response.ok) {
            let responseJson = await response.json()
            profiles = responseJson.data
            if (profiles.length > 0) profileChoosedId = profiles[0].idperfil
        } else { console.log("Can't fetch profiles.", response.status, response.statusText) }
    }

    async function saveSettings() {
        let permissionsGranted: number[] = []
        if (profilePermissions != undefined) {
            profilePermissions.windowPermissions.forEach((window: any) => {
                window.permissions.forEach((permission: any) => {
                    if (permission.hasPermission) permissionsGranted = [...permissionsGranted, permission.permissionId]
                })
            })
        }

        const response = await fetch(`${API_URL}/Admin/${profileChoosedId}/Permissions?module=SmartSurvey`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
            body: permissionsGranted && JSON.stringify(permissionsGranted)
        })
        if (response.ok) {
            console.log("Permissions changed")
            goto('/')
            //window.location.reload()
        } else { console.log("Can't change permissions in this profile") }
    }

    onMount(async () => {
        const unsubscribe = userStore.subscribe((temp: any) => { user = temp })
        unsubscribe()

        accessToken = getCookie("ss_at") ?? ""

        if (user && user.userId && user.userId > 0) {
            const module = user.authorizations.find(temp => temp.moduleType === 'SmartSurvey')
            const window = module?.windowPermissions.find(temp => temp.windowType === 'AdminSettings')
            const permission = window?.permissions.find(temp => temp.permissionType === 'Read')

            if (permission && !permission.hasPermission) {
                goto(`${base}/`)
            } else {
                await getProfiles()
                loaded = true
            }

        } else { goto(`${base}/`) }
    })
</script>

<svelte:head>
    <title>{m.pagePermissions()} - SmartSurvey</title>
</svelte:head>

{#if loaded}
    <div class="flex flex-col w-full gap-y-5">
        <h1 class="font-semibold text-2xl">{m.permissions()}</h1>

        <div class="flex flex-col gap-y-2">
            <div class="flex flex-col">
                <p class="font-medium">{m.chooseProfile()}</p>
                <p class="text-xs text-gray-400">{m.chooseProfileText()}</p>
            </div>

            {#if profiles.length > 0}
                <select bind:value={profileChoosedId} class="p-1 rounded border text-sm border-gray-300 bg-gray-200" id="selectProfile">
                    {#each profiles as profile}
                        <option value={profile.idperfil}>{profile.idperfil} - {profile.nome}</option>
                    {/each}
                </select>
            {/if}
        </div>
        <div class="flex flex-col gap-y-5">
            {#await getPermissionsOfProfile()}
                <div class="flex justify-center items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"><path stroke-dasharray="60" stroke-dashoffset="60" stroke-opacity=".3" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="1.3s" values="60;0"/></path><path stroke-dasharray="15" stroke-dashoffset="15" d="M12 3C16.9706 3 21 7.02944 21 12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.3s" values="15;0"/><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"/></path></g></svg>
                </div>
            {:then}
                <div class="flex flex-col gap-y-5">
                    {#if profilePermissions != undefined}
                        {#each profilePermissions.windowPermissions as wp, i}
                            <div class="flex flex-col gap-y-1">
                                <li class="text-black font-semibold">{wp.windowType}</li>
                                <div class="flex flex-col gap-y-1">
                                    {#each wp.permissions as p, j}
                                        <div class="flex gap-x-2 justify-between">
                                            <p>{p.permissionType}</p>
                                            <label class="toggle">
                                                <input bind:checked={p.hasPermission} id={`input_${i}_${j}`} type="checkbox" />
                                                <span class="slider"></span>
                                            </label>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
                <div class="flex justify-center">
                    <button on:click={() => saveSettings()} class="w-40 p-2 rounded text-white bg-blue-500 hover:bg-blue-700">{m.save()}</button>
                </div>
            {/await}
        </div>
    </div>
{/if}

<style>
    .toggle {
        display: inline-block;
        height: 22px;
        position: relative;
        width: 40px;
    }

    .toggle input {
        display: none;
    }

    .slider {
        background-color: gray;
        border-radius: 34px;
        bottom: 0;
        cursor: pointer;
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        transition: .4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 4px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked+.slider { background-color: #3B82F6; }
    input:checked+.slider:before { transform: translateX(14px); }
</style>