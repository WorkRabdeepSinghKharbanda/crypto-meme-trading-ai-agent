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
const TWEET_MAX_TIME = 1000 * 60 * 5; // 5 minutes
function setHeaderForTwitterAPI() {
    const headerForTwitterAPI = new Headers();
    headerForTwitterAPI.append("x-rapidapi-host", "twitter135.p.rapidapi.com");
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
        var _a, _b, _c;
        const requestOptionsForTwitterAPI = setHeaderForTwitterAPI();
        const fetchUserInfo = yield fetch(`https://twitter135.p.rapidapi.com/v2/UserByScreenName/?username=${userName}`, requestOptionsForTwitterAPI);
        const userInfo = yield fetchUserInfo.json();
        return (_c = (_b = (_a = userInfo === null || userInfo === void 0 ? void 0 : userInfo.data) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c.rest_id;
    });
}
function getUserTweets(userID) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const requestOptionsForTwitterAPI = setHeaderForTwitterAPI();
        const getUserTweets = yield fetch(`https://twitter135.p.rapidapi.com/v2/UserTweets/?id=${userID}&count=40`, requestOptionsForTwitterAPI);
        let userTweets = yield getUserTweets.json();
        userTweets =
            (_d = (_c = (_b = (_a = userTweets === null || userTweets === void 0 ? void 0 : userTweets.data) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.result) === null || _c === void 0 ? void 0 : _c.timeline_v2) === null || _d === void 0 ? void 0 : _d.timeline.instructions;
        for (let currentUserTweets of userTweets) {
            if ((currentUserTweets === null || currentUserTweets === void 0 ? void 0 : currentUserTweets.type) === "TimelineAddEntries") {
                userTweets = currentUserTweets === null || currentUserTweets === void 0 ? void 0 : currentUserTweets.entries;
                break;
            }
        }
        const parsingUserTweets = userTweets
            .filter((tweet) => {
            var _a, _b, _c, _d;
            const tweetData = (_d = (_c = (_b = (_a = tweet === null || tweet === void 0 ? void 0 : tweet.content) === null || _a === void 0 ? void 0 : _a.itemContent) === null || _b === void 0 ? void 0 : _b.tweet_results) === null || _c === void 0 ? void 0 : _c.result) === null || _d === void 0 ? void 0 : _d.legacy;
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
            const tweetData = (_d = (_c = (_b = (_a = tweet === null || tweet === void 0 ? void 0 : tweet.content) === null || _a === void 0 ? void 0 : _a.itemContent) === null || _b === void 0 ? void 0 : _b.tweet_results) === null || _c === void 0 ? void 0 : _c.result) === null || _d === void 0 ? void 0 : _d.legacy;
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
        return yield getUserTweets(userId);
    });
}
