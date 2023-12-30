import type { Tweet } from '@/@types/TwitterTypes';
import { filterTweets } from '@/util/checks';
import { getTweetsToHide, hideTweet, removeTweet } from '@/util/filter';

export default defineContentScript({
    matches: ['*://*.twitter.com/*'],
    runAt: 'document_start',
    main(ctx) {
        console.log('Hello content script!', { id: browser.runtime.id });
        injectXHRListener();
        document.addEventListener('RUMS_INTERCEPTED_REQUEST', eventHandler);
        addMutationObserver();
    },
});

export interface EventData<T> {
    status: string;
    url: string;
    data: T;
}

function addMutationObserver() {
    const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const addedNode = mutation.addedNodes[i];
                // some nodes are not elements, so we need to check
                if (!(addedNode instanceof HTMLElement)) continue;

                if (addedNode.tagName === 'DIV' && addedNode.getAttribute('data-testid') === 'cellInnerDiv') {
                    if (addedNode.querySelector('article[data-testid="tweet"]')) {
                        const tweet = addedNode.querySelector('article[data-testid="tweet"]');
                        if (tweet?.getAttribute('data-testid') === 'tweet') {
                            handleTweetElement(tweet as HTMLElement);
                        }
                    }
                }
                // console.debug('[MINUS-EGIRLS] Mutation detected:', addedNode);
            }
        }
    });
    observer.observe(document, { childList: true, subtree: true });
}

function handleTweetElement(tweetElement: HTMLElement) {
    const tweetUsername = Array.from(tweetElement.querySelectorAll('a[role="link"]'))?.[2]?.textContent; // with @ in front
    const tweetText = tweetElement.querySelector('div[data-testid="tweetText"]')?.textContent;
    console.log('[MINUS-EGIRLS] Checking Tweet: ', tweetUsername, tweetText);

    if (!tweetUsername || !tweetText) return;

    const tweetsToFilter = getTweetsToHide();
    const foundTweet = tweetsToFilter.find(tweet => {
        const username = tweet.core.user_results.result.legacy.screen_name;
        const text = tweet.legacy.full_text; // contains more than just the tweet text, e.g. reply-mention and tweet url
        
        return tweetUsername === `@${username}` && text?.indexOf(tweetText) > -1;
    });
    
    if (foundTweet) {
        removeTweet(foundTweet);
        hideTweet(tweetElement);
    }
}

async function eventHandler(e: Event) {
    const eventData = (<CustomEvent>e).detail as EventData<any>;

    const graphql_data = eventData?.data?.data;
    if (eventData.url.includes('TweetResultByRestId')) {
        // if not logged in?
        console.log('[MINUS-EGIRLS] TweetResultByRestId', graphql_data);
        const profile_url = graphql_data.tweetResult?.result?.core?.user_results?.result?.legacy?.entities?.url?.urls?.[0].expanded_url;
        const profile_desc = graphql_data?.tweetResult?.result?.core?.user_results?.result?.legacy?.description;
        const tweet_text = graphql_data?.tweetResult?.result?.legacy?.full_text;

        console.log('[MINUS-EGIRLS] TweetResultByRestId', {
            profile_url,
            profile_desc,
            tweet_text,
        });
    } else if (eventData.url.includes('TweetDetail')) {
        // standard single tweet response
        console.log('[MINUS-EGIRLS] TweetDetail', graphql_data);
        const tweet = graphql_data?.threaded_conversation_with_injections_v2?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).startsWith('tweet'))
            .map((entry: any) => entry?.content?.itemContent?.tweet_results?.result) as Tweet[];
        const conversations = graphql_data?.threaded_conversation_with_injections_v2?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).startsWith('conversationthread'))
            .map((entry: any) => entry?.content?.items?.[0].item?.itemContent?.tweet_results?.result) as Tweet[];

        console.log('[MINUS-EGIRLS] TweetDetail Tweets: ', tweet, conversations);
        if (conversations && conversations.length > 0) {
            filterTweets(conversations);
        }
    } else if (eventData.url.includes('UserTweets')) {
        console.log('[MINUS-EGIRLS] UserTweets', graphql_data);
    } else if (eventData.url.includes('HomeTimeline')) {
        console.log('[MINUS-EGIRLS] HomeTimeline', graphql_data);
        // promoted-tweet- vs. tweet-
        const tweets = graphql_data?.home?.home_timeline_urt?.instructions?.[0]?.entries
            ?.filter((entry: any) => String(entry?.entryId).includes('tweet'))
            .map((entry: any) => entry?.content?.itemContent?.tweet_results?.result) as Tweet[];

        console.log('[MINUS-EGIRLS] HomeTimeline Tweets: ', tweets);
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
