// const PATH_URL = 'https://twitter135.p.rapidapi.com/v2';
const PATH_URL_FOR_REST_ID = "https://twitter-api45.p.rapidapi.com";
const PATH_URL_FOR_TWEETS = "https://twitter-v24.p.rapidapi.com";
const X_RAPID_HOST_ID = "twitter-api45.p.rapidapi.com";
const X_RAPID_HOST_TWEETS = "twitter-v24.p.rapidapi.com";

const TWEET_MAX_TIME = 1000 * 60 * 10; // 10 minutes

export interface TweetsObject {
  id: string;
  content: string;
  date: string;
}

function setHeaderForTwitterAPI(xRapidPath: string) {
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
    redirect: "follow" as RequestRedirect,
  };

  return requestOptions;
}

async function getUserId(userName: string) {
  const requestOptionsForTwitterAPI = setHeaderForTwitterAPI(X_RAPID_HOST_ID);
  const fetchUserInfo = await fetch(
    `${PATH_URL_FOR_REST_ID}/screenname.php?screenname=${userName}`,
    requestOptionsForTwitterAPI
  );
  const userInfo = await fetchUserInfo.json();
  return userInfo?.rest_id || "";
}

async function getUserTweets(userID: string) {
  const requestOptionsForTwitterAPI =
    setHeaderForTwitterAPI(X_RAPID_HOST_TWEETS);
  const getUserTweets = await fetch(
    `${PATH_URL_FOR_TWEETS}/user/tweets?user_id=${userID}&limit=40`,
    requestOptionsForTwitterAPI
  );
  let userTweets = await getUserTweets.json();
  userTweets = userTweets?.data?.user_result?.result?.timeline_response?.timeline
      ?.instructions;

  for (let currentUserTweets of userTweets) {
    if (currentUserTweets?.__typename === "TimelineAddEntries") {
      console.log()
      userTweets = currentUserTweets?.entries;
      break;
    }
  }

  console.log("userTweets -> ", userTweets);

  const parsingUserTweets: TweetsObject[] = userTweets
    .filter((tweet: any) => {
      const tweetData = tweet?.content?.content?.tweetResult?.result?.legacy;
      console.log("tweetData -> ", tweetData);

      if (!tweetData?.created_at) return false;

      const currentDate = new Date();
      const tweetDate = new Date(tweetData.created_at);
      const tweetId = tweetData?.conversation_id_str;
      const tweetContent = tweetData?.full_text;

      return (
        currentDate.getTime() - tweetDate.getTime() <= TWEET_MAX_TIME &&
        tweetId &&
        tweetContent &&
        tweetDate
      );
    })
    .map((tweet: any) => {
      const tweetData = tweet?.content?.content?.tweetResult?.result?.legacy;

      return {
        id: tweetData.conversation_id_str,
        content: tweetData.full_text,
        date: new Date(tweetData.created_at),
      };
    });

  return parsingUserTweets;
}

export async function getTweets(userName: string) {
  const userId: string = await getUserId(userName);
  if (!userId) {
    throw new Error("UserId not found");
  }
  return await getUserTweets(userId);
}
