import type { Tweet, TweetEntityURL } from "@/@types/TwitterTypes";
import { addTweetsToHide } from "./filter";
import { ExtensionStorage } from "./storage";

export async function filterTweets(tweets: Array<Tweet>) {
    const filterStrength = await ExtensionStorage.filterStrength.getValue();
    const tweetsToFilter = tweets.filter(tweet => {
        const urlCheck1 = checkProfileURL(tweet.core?.user_results?.result?.legacy?.entities?.url?.urls, filterStrength);
        const urlCheck2 = checkProfileURL(tweet.core?.user_results?.result?.legacy?.entities?.description.urls, filterStrength);

        const descriptionCheck = checkTextForKeyword(tweet.core?.user_results?.result?.legacy?.description, filterStrength);

        let tweetCheck = false;
        if (filterStrength == 2) {
            tweetCheck = checkTextForKeyword(tweet.legacy.full_text, filterStrength);
        }

        let count = 0;
        if (urlCheck1) count++;
        if (urlCheck2) count++;
        if (descriptionCheck) count++;
        if (tweetCheck) count++;

        return count >= 2;
    });

    console.log('[MINUS-EGIRLS] Tweets to filter: ', tweetsToFilter);

    addTweetsToHide(tweetsToFilter.map(tweet => {
        let newTweet = tweet;
        newTweet.legacy.full_text = newTweet.legacy.full_text.replace(/\p{Emoji}/gu, '');
        return newTweet;
    }));
}

const keywords = ['free of', 'onlyfans', 'porn', 'adults', '18+', 'nsfw', 'boobies', 'naughty', '🍓', '🍆', '🍌', '🍒', '🍑', '🤭', '💦', '👅', '😈', '🔞'];

const keywordsStrong = ['💕', '❤️', 'boob'];

function checkTextForKeyword(text: string | undefined, strength: number) {
    if (!text) return false;

    const standardCheck = keywords.some(word => text.toLowerCase().indexOf(word) > -1);

    let strongCheck = false;
    if (strength === 2) {
        strongCheck = keywordsStrong.some(word => text.toLowerCase().indexOf(word) > -1);
    }

    return standardCheck || strongCheck;
}

function checkProfileURL(urls: TweetEntityURL[] | undefined, strength: number) {
    if (!urls) return false;

    const urlToFilter = ['onlyfans.com', 'linkfly.to', 'beacons.ai', 'snipfeed.co', 'allmylinks.com', 'msha.ke'];
    if (strength == 2) {
        urlToFilter.push('fansly.com');
    }

    return urls.some(url => urlToFilter.some(filter => url.display_url.toLowerCase().indexOf(filter) > -1));
}