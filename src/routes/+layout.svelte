<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit'
	import { i18n } from '$lib/i18n'

	import '../app.css'
	import Header from '$lib/components/Header.svelte'
	import Sidebar from '$lib/components/Sidebar.svelte'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { getCookie } from '$lib/helpers/cookies';
	import { BadgeAlertIcon } from 'lucide-svelte';
	import { userStore } from '$lib/stores/user'
	import { languageTag, setLanguageTag } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages'

	let authToken: string | null
	let lang: any
	let token = ""
	let accessToken = ""
	let refreshToken = ""
	let user: User
	let loaded = false

	onMount(async () => {
		authToken = $page.url.searchParams.get('token')
		lang = $page.url.searchParams.get('lang') ?? 'pt'

		if (lang) setLanguageTag(lang)

		if (authToken) {
			token = encodeURIComponent(authToken)
			let responseTokens = await fetch(`http://localhost:9003/api/v1/Accounts?token=${token}`)
			if (responseTokens.ok) {
				let responseJson = await responseTokens.json()
				accessToken = responseJson.data.token
				refreshToken = responseJson.data.refreshToken
				document.cookie = `ss_at=${accessToken}`
				document.cookie = `ss_rt=${refreshToken}`
			} else { console.log("Can't get access and refresh tokens.") }
		} else {
			accessToken = getCookie('ss_at') ?? ""
			refreshToken = getCookie('ss_rt') ?? ""
		}

		if (accessToken !== "" && refreshToken !== "") {
			let responseUser = await fetch(`http://localhost:9003/api/v1/Users/Me`, { headers: { 'Authorization': 'Bearer ' + accessToken } })
			if (responseUser.ok) {
				let responseJson = await responseUser.json()
				user = responseJson.data
			} else if (responseUser.status === 401 && responseUser.statusText === 'Unauthorized') {
				refreshToken = encodeURIComponent(refreshToken)
				let responseNewTokens = await fetch(`http://localhost:9003/api/v1/Accounts?refreshToken=${refreshToken}`, {
					method: 'POST',
					headers: { 'Authorization': 'Bearer ' + accessToken } 
				})
				if (responseNewTokens.ok) {
					let responseJson = await responseNewTokens.json()
					accessToken = responseJson.data.token
					refreshToken = responseJson.data.refreshToken
					document.cookie = `ss_at=${accessToken}`
					document.cookie = `ss_rt=${refreshToken}`
				}

				responseUser = await fetch(`http://localhost:9003/api/v1/Users/Me`, { headers: { 'Authorization': 'Bearer ' + accessToken } })
				if (responseUser.ok) {
					let responseJson = await responseUser.json()
					user = responseJson.data
				}
			} else { console.log("Can't get user.") }
		}

		if (user) userStore.set(user)
		console.log(user)
		loaded = true
	})
</script>

<svelte:head>
	<title>SmartSurvey</title>
</svelte:head>

<ParaglideJS {i18n}>
	<div class="min-w-screen min-h-screen flex flex-col items-center bg-gray-100">
		{#if loaded && user}
			<Header {user} />
			<div class="flex h-full w-[1440px]">
				<Sidebar {user} />
				<div class="flex w-full ml-[200px] px-5 py-3">
					<slot />
				</div>
			</div>
		{:else if loaded}
			<div class="min-h-screen flex flex-col justify-center items-center gap-y-5">
				<svelte:component this={BadgeAlertIcon} size={50} strokeWidth={1.5} />
				<p>{m.notLoggedIn()}</p>
			</div>
		{:else}
			<p>{m.loading()}</p>
		{/if}
	</div>
</ParaglideJS>