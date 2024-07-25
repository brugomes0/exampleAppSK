<script lang="ts">
    import { CircleUserRoundIcon } from 'lucide-svelte'

    export let user: User
</script>

<div class="sticky top-0 flex items-center justify-between w-full px-5 py-3 border-b bg-opacity-100 bg-gray-100 border-gray-300 z-20">
    <a class="font-bold hover:text-gray-600" href="/">SmartSurvey</a>
    <div class="flex items-center gap-x-2 cursor-default">
        <p class="text-sm">{user.userName}</p>
        <svelte:component this={CircleUserRoundIcon} />
    </div>
</div>