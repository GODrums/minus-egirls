<script lang="ts">
    import TwitterLogo from '../../assets/twitter.svg';
    import XLogo from '../../assets/x.svg';
    import PowerOn from '../../assets/power-on.svg';
    import PowerOff from '../../assets/power-off.svg';
    import { onMount } from 'svelte';
    import { ExtensionStorage } from '@/util/storage';
    import DiscordIcon from '../../assets/discord.svg';
    import TwitterIcon from '../../assets/twitter2.svg';
    import SteamIcon from '../../assets/steam.svg';
    import NavLink from '@/lib/NavLink.svelte';

    let enabled = true;
    let strength = 1;

    $: isOn = enabled;
    $: strengthInPercent = strength * 50;

    onMount(async () => {
        enabled = await ExtensionStorage.enabled.getValue();
        console.log('enabled: ', enabled);
        strength = await ExtensionStorage.filterStrength.getValue();
    });

    const toggle = async () => {
        isOn = !isOn;
        await ExtensionStorage.enabled.setValue(isOn);
    };

    const setStrength = async (event: any) => {
        strength = event.target.value / 50;
        await ExtensionStorage.filterStrength.setValue(strength);
    };

    function openLink(link: string) {
        browser.tabs.create({ url: link });
    }
</script>

<div class="container w-[320px] h-[350px] p-5">
    <div class="flex flex-col justify-center items-center">
        <h1 class="font-bold ms-3 me-3 text-3xl" style="background: linear-gradient(to right, #00c7b5 0%, #1769aa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Minus-Egirls
        </h1>
        <div class="flex items-center mt-0.5">
            <img src={TwitterLogo} class="inline-block w-6 h-6" alt="Twitter Logo" />
            <div class="divider divider-neutral divider-horizontal mx-0.5"></div>
            <img src={XLogo} class="inline-block w-6 h-6" alt="X Logo" />
        </div>
    </div>

    <div class="flex flex-col justify-center items-center">
        <label class="swap btn btn-ghost py-8 my-4">
            <input type="checkbox" checked={isOn} on:click={toggle} />
            <div class="swap-on flex items-center">
                <img src={PowerOn} class="h-12" alt="Power On" />
                <div class="badge badge-accent ml-2">ON</div>
            </div>
            <div class="swap-off flex items-center">
                <img src={PowerOff} class="h-12" alt="Power Off" />
                <div class="badge badge-warning ml-2">OFF</div>
            </div>
        </label>

        <div class="w-full">
            <input type="range" min="0" max="100" value={strengthInPercent} class="range {isOn ? 'range-accent' : 'range-warning'}" step="50" on:click={setStrength} disabled={!isOn} />
            <div class="w-full flex justify-between text-xs px-2">
                <span>Weak</span>
                <span>Medium</span>
                <span>Strong</span>
            </div>
        </div>

        <p class="w-full mt-4 text-center">Select your desired filter strength. <br /> Stronger filters will block content more reliably but might lead to false positives.</p>

        <div class="divider divider-vertical my-1 mx-12"></div>
        <nav class="grid grid-flow-col grid-cols-2 grid-rows-1 gap-6">
            <NavLink src={DiscordIcon} link="https://discord.gg/VQWXp33nSW" />
            <NavLink src={TwitterIcon} link="https://twitter.com/rumscsgo" />
            <NavLink src={SteamIcon} link="https://steamcommunity.com/id/rums" />
        </nav>
    </div>
</div>
