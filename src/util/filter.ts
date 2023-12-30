import type { Tweet } from '@/@types/TwitterTypes';

let tweetsToHide: Array<Tweet> = [];

export function addTweetsToHide(tweets: Tweet[]) {
    tweetsToHide.push(...tweets);
}

export function getTweetsToHide() {
    return tweetsToHide;
}

export function removeTweet(tweet: Tweet) {
    const index = tweetsToHide.indexOf(tweet);
    if (index > -1) {
        tweetsToHide.splice(index, 1);
    }
}

export async function hideTweet(tweetElement: HTMLElement, reason?: string) {
    (<HTMLElement>tweetElement.firstElementChild).style.display = 'none';
    const blockedText = 'Blocked by MinusEgirls: This tweet is hidden because the creator is likely an e-girl.' + reason ? ` Reason: ${reason}` : '';
    const elementOverlay = `<div class="minusegirls-content-overlay" style="width: 100%;"><div style="display: flex;justify-content: space-between;background-color: rgb(22, 24, 28);border: 1px solid rgb(32, 35, 39);padding: 15px;margin: 10px 0;border-radius: 10px;"><span style="color: rgb(113, 118, 123);font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif;">${blockedText}</span><button class="minusegirls-show-button" style="background: none;border: none;font-family: TwitterChirp, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, Helvetica, Arial, sans-serif;color: rgb(239, 243, 244);"><span style="font-size: 14px;font-weight: 600;">Show</span></button></div></div>`;
    tweetElement.insertAdjacentHTML('beforeend', elementOverlay);
    tweetElement.querySelector('.minusegirls-show-button')?.addEventListener('click', () => {
        (<HTMLElement>tweetElement.firstElementChild).style.display = 'block';
        tweetElement.querySelector('.minusegirls-content-overlay')?.remove();
    });
}
