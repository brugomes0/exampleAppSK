<script lang="ts">
    import { base } from "$app/paths"
	import { goto } from "$app/navigation"
	import { userStore } from "$lib/stores/user"
	import { FilePlusIcon } from "lucide-svelte"
	import { onMount } from "svelte"

    let currentPage = 1
    let loaded: boolean = false
    let languagesArray: string[] = ['PT', 'EN', 'ES', 'FR', 'PL']
    let languagesChoosed: string[] = []
    let user: User

    let template: Template = {
		templateId: "",
		createdDate: "",
		modifiedDate: "",
		createdByUserId: 0,
		translations: [],
		categories: [],
		ratingOptions: []
	}

    function nextPage() {
        if (languagesChoosed.length == 0) { console.log("At least one language"); return; }

        template.translations = languagesChoosed.map(lang => ({translationId: "", language: lang, title: "", description: ""}))
        currentPage++
    }

    onMount(() => {
        let unsubscribe = userStore.subscribe(temp => user = temp)
        unsubscribe()

        if (user && user.userId && user.userId > 0) {
            const module = user.authorizations.find(temp => temp.moduleType === 'SmartSurvey')
            const window = module?.windowPermissions.find(temp => temp.windowType === 'Templates')
            const permission = window?.permissions.find(temp => temp.permissionType === 'Create')

            if (!permission?.hasPermission) {
                goto(`${base}/`)
            } else {
                console.log(user.userId)
                template.createdByUserId = user.userId
                loaded = true
            }
        } else { goto(`${base}/`) }
    })
</script>

{#if loaded}
    <div class="flex flex-col gap-y-5 w-full">
        <div class="flex items-center gap-x-4">
            <div class="flex-shrink-0 w-20 h-20">
                <svelte:component
                    this={FilePlusIcon} 
                    size={100} 
                    strokeWidth={1.5}
                    class="w-full h-full text-blue-500"
                />
            </div>
            <div class="flex flex-col">
                <h1 class="font-semibold text-xl">Create Template</h1>
                <p class="text-gray-400 text-sm">Cria um modelo com categorias e questões. Estes modelos são usados para a criação de um inquérito.</p>
            </div>
        </div>

        {#if currentPage == 1}
            <div class="flex flex-col gap-y-2">
                <div class="flex flex-col">
                    <p class="font-semibold">Selecionar idiomas</p>
                    <p class="text-xs text-gray-400">Selecione as linguagens com as quais deseja criar o modelo. Deve escolher pelo menos uma para avançar.</p>
                </div>
                <div class="flex flex-col">
                    {#each languagesArray as language}
                        <label class="flex w-[100px] gap-x-2 items-baseline cursor-pointer">
                            <input bind:group={languagesChoosed} type="checkbox" value={language} />
                            {language}
                        </label>
                    {/each}
                </div>
            </div>
            <div class="flex justify-center">
                <button on:click={() => nextPage()} class="button">Continuar</button>
            </div>
        {:else}
            <p>Template Component</p>
        {/if}
    </div>
{/if}