import type { Tweet, TweetEntityURL } from "@/@types/TwitterTypes";
import { addTweetsToHide } from "./filter";

export async function filterTweets(tweets: Array<Tweet>) {
    const tweetsToFilter = tweets.filter(tweet => {
        const urlCheck = checkProfileURL(tweet.core?.user_results?.result?.legacy?.entities?.url?.urls);

        return urlCheck;
    });

    console.log('[MINUS-EGIRLS] Tweets to filter: ', tweetsToFilter);

    addTweetsToHide(tweetsToFilter.map(tweet => {
        let newTweet = tweet;
        newTweet.legacy.full_text = newTweet.legacy.full_text.replace(/\p{Emoji}/gu, '');
        return newTweet;
    }));
}

function checkProfileURL(urls: TweetEntityURL[] | undefined) {
    if (!urls) return false;

    const urlToFilter = ['onlyfans.com', 'linkfly.to', 'beacons.ai', 'linktr.ee', 'fansly.com', 'snipfeed.co'];

    return urls.some(url => urlToFilter.some(filter => url.display_url.indexOf(filter) > -1));
}