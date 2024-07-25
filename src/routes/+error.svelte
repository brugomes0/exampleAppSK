<script lang="ts">
    import { page } from "$app/stores"
</script>

<div class="flex flex-col gap-y-1 items-center justify-center w-full">
    <p>{$page.status}</p>
    <p>{$page.error?.message}</p>
</div>