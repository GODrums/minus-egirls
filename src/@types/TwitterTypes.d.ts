export type Tweet = {
    core: TweetCore;
    legacy: TweetLegacy;
    note_tweet: TweetNoteTweet;
}

export type TweetCore = {
    user_results: {
        result: {
            id: string;
            legacy: {
                description: string;
                name: string;
                screen_name: string;
                verified: boolean;
                entities: {
                    description: {
                        urls: TweetEntityURL[];
                    };
                    url: {
                        urls: TweetEntityURL[];
                    };
                };
            };
        };
    };
}

export type TweetLegacy = {
    bookmarked: boolean;
    full_text: string;
    retweeted: boolean;
    favorited: boolean;
    favorite_count: number;
    entities: {
        urls: TweetEntityURL[];
    };
    extended_entities: {
        media: TweetEntityURL[];
    };
}

export type TweetNoteTweet = {
    note_tweet_results: {
        result: {
            text: string;
            entity_set: {
                urls: any[];
            }
        };
    }
}

export type TweetEntityURL = {
    display_url: string; // without http
    expanded_url: string; // with http
    url: string; // t.co
}