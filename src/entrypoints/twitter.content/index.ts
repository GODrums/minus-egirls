import type { Tweet } from '@/@types/TwitterTypes';
import { filterTweets } from '@/util/checks';
import { getTweetsToHide, hideTweet } from '@/util/filter';
import { ExtensionStorage } from '@/util/storage';

export default defineContentScript({
    matches: ['*://*.twitter.com/*'],
    runAt: 'document_start',
    main(ctx) {
        // console.log('Hello content script!', { id: browser.runtime.id });
        setTimeout(async () => {
            if (!(await ExtensionStorage.enabled.getValue())) return;
            injectXHRListener();
            document.addEventListener('RUMS_INTERCEPTED_REQUEST', eventHandler);
            addMutationObserver();
        }, 10);
    },
});

export interface EventData<T> {
    status: string;
    url: string;
    data: T;
}

function addMutationObserver() {
    let lastAddedTweet: number = 0;
    const observer = new MutationObserver(async (mutations) => {
        let newTweetElements: HTMLElement[] = [];
        for (const mutation of mutations) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const addedNode = mutation.addedNodes[i];
                // some nodes are not elements, so we need to check
                if (!(addedNode instanceof HTMLElement)) continue;

                if (addedNode.tagName === 'DIV' && addedNode.getAttribute('data-testid') === 'cellInnerDiv') {
                    if (addedNode.querySelector('article[data-testid="tweet"]')) {
                        const tweet = addedNode.querySelector('article[data-testid="tweet"]');
                        if (tweet?.getAttribute('data-testid') === 'tweet') {
                            // handleTweetElement(tweet as HTMLElement);
                            newTweetElements.push(tweet as HTMLElement);
                            // console.debug('[MINUS-EGIRLS] Tweet detected:', lastAddedTweet);
                        }
                    }
                }
                // console.debug('[MINUS-EGIRLS] Mutation detected:', addedNode);
            }
        }
        if (newTweetElements.length === 0) return;
        // console.debug('[MINUS-EGIRLS] Mutation detected:', newTweetElements.length);
        let timeout = 10;
        if (Date.now() - lastAddedTweet > 2000) {
            timeout = 2000;
        }
        lastAddedTweet = Date.now();
        setTimeout(async () => {
            for (const tweetElement of newTweetElements) {
                await handleTweetElement(tweetElement);
            }
        }, timeout);
    });
    observer.observe(document, { childList: true, subtree: true });
}

const convertFavCount = (tweetElement: HTMLElement) => {
    const elementValue = tweetElement.querySelectorAll('span[data-testid="app-text-transition-container"]')[2]?.textContent ?? '0';
    if (Number.isNaN(parseInt(elementValue.charAt(elementValue.length - 1)))) {
        const multiplier = elementValue.substr(-1).toLowerCase();
        if (multiplier == 'k') return parseFloat(elementValue) * 1000;
        else if (multiplier == 'm') return parseFloat(elementValue) * 1000000;
        return 0;
    } else {
        return parseInt(elementValue);
    }
};

async function handleTweetElement(tweetElement: HTMLElement) {
    const tweetUsername = Array.from(tweetElement.querySelectorAll('a[role="link"]'))?.[2]?.textContent; // with @ in front
    const tweetText = tweetElement.querySelector('div[data-testid="tweetText"]')?.textContent;
    const tweetFavoriteCount = convertFavCount(tweetElement);

    if (!tweetUsername) return;

    let tweetsToFilter = getTweetsToHide();
    while (tweetsToFilter.length === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        tweetsToFilter = getTweetsToHide();
    }
    const foundTweet = tweetsToFilter.find((tweet) => {
        const username = tweet.core.user_results.result.legacy.screen_name;
        const text = tweet.legacy.full_text; // contains more than just the tweet text, e.g. reply-mention and tweet url

        if (tweetUsername === `@${username}`) {
            // console.log('[MINUS-EGIRLS] Found Tweet: ', tweet);
            if (tweetText && text?.indexOf(tweetText) > -1) return true;

            const favoriteCount = tweet.legacy.favorite_count;
            const favRelative = favoriteCount / tweetFavoriteCount;
            return tweetUsername === `@${username}` && favRelative > 0.9 && favRelative < 1.1;
        }
        return false;
    });

    if (foundTweet) {
        hideTweet(tweetElement);
    }
}

async function eventHandler(e: Event) {
    const eventData = (<CustomEvent>e).detail as EventData<any>;

    const graphql_data = eventData?.data?.data;
    if (eventData.url.includes('TweetResultByRestId')) {
        // if not logged in?
        const profile_url = graphql_data.tweetResult?.result?.core?.user_results?.result?.legacy?.entities?.url?.urls?.[0].expanded_url;
        const profile_desc = graphql_data?.tweetResult?.result?.core?.user_results?.result?.legacy?.description;
        const tweet_text = graphql_data?.tweetResult?.result?.legacy?.full_text;

        console.debug('[MINUS-EGIRLS] TweetResultByRestId', {
            profile_url,
            profile_desc,
            tweet_text,
        });
    } else if (eventData.url.includes('TweetDetail')) {
        // standard single tweet response
        const tweet = graphql_data?.threaded_conversation_with_injections_v2?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).startsWith('tweet'))
            .map((entry: any) => entry?.content?.itemContent?.tweet_results?.result) as Tweet[];
        const conversations = graphql_data?.threaded_conversation_with_injections_v2?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).startsWith('conversationthread'))
            .map((entry: any) => entry?.content?.items?.[0].item?.itemContent?.tweet_results?.result) as Tweet[];

        console.debug('[MINUS-EGIRLS] TweetDetail Tweets: ', tweet, conversations);
        if (conversations && conversations.length > 0) {
            filterTweets(conversations);
        }
    } else if (eventData.url.includes('UserTweets')) {
        // console.log('[MINUS-EGIRLS] UserTweets', graphql_data);
        const tweets = graphql_data?.user.result.timeline_v2.timeline.instructions[2].entries
            ?.filter((entry: any) => String(entry?.entryId).startsWith('tweet'))
            ?.map((entry: any) => entry?.content?.itemContent?.tweet_results?.result) as Tweet[];

        console.debug('[MINUS-EGIRLS] UserTweets Tweets: ', tweets);
        filterTweets(tweets);
    } else if (eventData.url.includes('HomeTimeline')) {
        // promoted-tweet- vs. tweet-
        const tweets = graphql_data?.home?.home_timeline_urt?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).includes('tweet'))
            .map((entry: any) => entry?.content?.itemContent?.tweet_results?.result) as Tweet[];

        console.debug('[MINUS-EGIRLS] HomeTimeline Tweets: ', tweets);
        filterTweets(tweets);
    } else if (eventData.url.includes('Bookmarks')) {
        const tweets = graphql_data?.bookmark_timeline_v2?.timeline?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).includes('tweet'))
            .map((entry: any) => entry?.content?.itemContent?.tweet_results?.result) as Tweet[];

        console.debug('[MINUS-EGIRLS] Bookmarks Tweets: ', tweets);
        filterTweets(tweets);
    }
}

function injectXHRListener() {
    const script = document.createElement('script');
    script.src = browser.runtime.getURL('/inject.js');
    script.onload = function () {
        (<HTMLScriptElement>this).remove();
    };
    (document.head || document.documentElement).appendChild(script);
}
