<script lang="ts">
    import { base } from '$app/paths'
    import { BarChartBigIcon, ClipboardIcon, HomeIcon, LayoutTemplateIcon, SettingsIcon } from 'lucide-svelte'
	import { onMount } from 'svelte'
    import * as m from "$lib/paraglide/messages"

    export let user: User

    let loaded = false
    let items = [
        { name: "Home", icon: HomeIcon, permission: true, label: m.home() },
        { name: "Surveys", icon: ClipboardIcon, permission: false, label: m.surveys() },
        { name: "Templates", icon: LayoutTemplateIcon, permission: false, label: m.templates() },
        { name: "Statistics", icon: BarChartBigIcon, permission: false, label: m.statistics()},
        { name: "Permissions", icon: SettingsIcon, permission: false, label: m.permissions()}
    ]

    onMount(() => {
        items.forEach(item => {
            if (item.name === 'Home') { item.permission = true; return }

            const module = user.authorizations.find(temp => temp.moduleType === 'SmartSurvey')
            const window = module?.windowPermissions.find(temp => temp.windowType === item.name || temp.windowType === 'AdminSettings')
            const permission = window?.permissions.find(temp => temp.permissionType === 'Read')

            if (permission && permission.hasPermission) item.permission = true
        })

        loaded = true
    })
</script>

{#if loaded}
    <div class="fixed flex flex-col w-[200px] h-full">
        {#each items as item}
            {#if item.permission}
                <a class="flex gap-x-2 items-center px-5 py-2 hover:text-gray-600" href={item.name === 'Home' ? `${base}/` : `${base}/${item.name.toLowerCase()}`}>
                    <svelte:component this={item.icon} />
                    {item.label}
                </a>
            {/if}
        {/each}
    </div>
{/if}