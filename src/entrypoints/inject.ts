export default defineUnlistedScript({
    main() {
        openIntercept();
    },
});

function openIntercept() {
    const open = window.XMLHttpRequest.prototype.open;
    console.log('[MINUS-EGIRLS] Activating HttpRequest Intercept...');

    window.XMLHttpRequest.prototype.open = function (method, url) {
        this.addEventListener('load', (e) => {
            const target = <XMLHttpRequest>e.currentTarget;
            const validURLs = ['HomeTimeline', 'UserTweets', 'TweetDetail', 'TweetResultByRestId', 'Bookmarks'];

            if (!target.responseURL.includes(location.hostname) ||!validURLs.some(url => target.responseURL.includes(url))) {
                return;
            }

            function parseJSON(text: string): undefined | any {
                try {
                    return JSON.parse(text);
                } catch (_) {
                    return {
                        text: text,
                    };
                }
            }

            // request finished loading
            if (target.readyState == 4) {
                console.debug('[MINUS-EGIRLS] Intercepted HTTP request to: ' + target.responseURL, parseJSON(target.responseText));
                document.dispatchEvent(
                    new CustomEvent('RUMS_INTERCEPTED_REQUEST', {
                        detail: {
                            status: target.status,
                            url: target.responseURL,
                            data: parseJSON(target.responseText),
                        },
                    })
                );
            }
        });

        return open.apply(this, <any>arguments);
    };
}
