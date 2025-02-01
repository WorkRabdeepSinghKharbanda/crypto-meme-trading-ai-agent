"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTweets = getTweets;
// const PATH_URL = 'https://twitter135.p.rapidapi.com/v2';
const PATH_URL_FOR_REST_ID = "https://twitter-api45.p.rapidapi.com";
const PATH_URL_FOR_TWEETS = "https://twitter-v24.p.rapidapi.com";
const X_RAPID_HOST_ID = "twitter-api45.p.rapidapi.com";
const X_RAPID_HOST_TWEETS = "twitter-v24.p.rapidapi.com";
const TWEET_MAX_TIME = 1000 * 60 * 60 * 24; // 10 minutes
function setHeaderForTwitterAPI(xRapidPath) {
    const headerForTwitterAPI = new Headers();
    headerForTwitterAPI.append("x-rapidapi-host", xRapidPath);
    const rapidApiKey = process.env.RAPID_API_KEY;
    if (!rapidApiKey) {
        throw new Error("RAPID_API_KEY is not defined");
    }
    headerForTwitterAPI.append("x-rapidapi-key", rapidApiKey);
    const requestOptions = {
        method: "GET",
        headers: headerForTwitterAPI,
        redirect: "follow",
    };
    return requestOptions;
}
function getUserId(userName) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestOptionsForTwitterAPI = setHeaderForTwitterAPI(X_RAPID_HOST_ID);
        const fetchUserInfo = yield fetch(`${PATH_URL_FOR_REST_ID}/screenname.php?screenname=${userName}`, requestOptionsForTwitterAPI);
        const userInfo = yield fetchUserInfo.json();
        return (userInfo === null || userInfo === void 0 ? void 0 : userInfo.rest_id) || "";
    });
}
function getUserTweets(userID) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const requestOptionsForTwitterAPI = setHeaderForTwitterAPI(X_RAPID_HOST_TWEETS);
        const getUserTweets = yield fetch(`${PATH_URL_FOR_TWEETS}/user/tweets?user_id=${userID}&limit=40`, requestOptionsForTwitterAPI);
        let userTweets = yield getUserTweets.json();
        userTweets = (_e = (_d = (_c = (_b = (_a = userTweets === null || userTweets === void 0 ? void 0 : userTweets.data) === null || _a === void 0 ? void 0 : _a.user_result) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c.timeline_response) === null || _d === void 0 ? void 0 : _d.timeline) === null || _e === void 0 ? void 0 : _e.instructions;
        for (let currentUserTweets of userTweets) {
            if ((currentUserTweets === null || currentUserTweets === void 0 ? void 0 : currentUserTweets.__typename) === "TimelineAddEntries") {
                console.log();
                userTweets = currentUserTweets === null || currentUserTweets === void 0 ? void 0 : currentUserTweets.entries;
                break;
            }
        }
        console.log("userTweets -> ", userTweets);
        const parsingUserTweets = userTweets
            .filter((tweet) => {
            var _a, _b, _c, _d;
            const tweetData = (_d = (_c = (_b = (_a = tweet === null || tweet === void 0 ? void 0 : tweet.content) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.tweetResult) === null || _c === void 0 ? void 0 : _c.result) === null || _d === void 0 ? void 0 : _d.legacy;
            console.log("tweetData -> ", tweetData);
            if (!(tweetData === null || tweetData === void 0 ? void 0 : tweetData.created_at))
                return false;
            const currentDate = new Date();
            const tweetDate = new Date(tweetData.created_at);
            const tweetId = tweetData === null || tweetData === void 0 ? void 0 : tweetData.conversation_id_str;
            const tweetContent = tweetData === null || tweetData === void 0 ? void 0 : tweetData.full_text;
            return (currentDate.getTime() - tweetDate.getTime() <= TWEET_MAX_TIME &&
                tweetId &&
                tweetContent &&
                tweetDate);
        })
            .map((tweet) => {
            var _a, _b, _c, _d;
            const tweetData = (_d = (_c = (_b = (_a = tweet === null || tweet === void 0 ? void 0 : tweet.content) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.tweetResult) === null || _c === void 0 ? void 0 : _c.result) === null || _d === void 0 ? void 0 : _d.legacy;
            return {
                id: tweetData.conversation_id_str,
                content: tweetData.full_text,
                date: new Date(tweetData.created_at),
            };
        });
        return parsingUserTweets;
    });
}
function getTweets(userName) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = yield getUserId(userName);
        if (!userId) {
            throw new Error("UserId not found");
        }
        return yield getUserTweets(userId);
    });
}
