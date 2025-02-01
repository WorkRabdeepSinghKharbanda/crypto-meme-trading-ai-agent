const TWEET_MAX_TIME = 1000 * 60 * 10; // 10 minutes

export interface TweetsObject {
  id: string;
  content: string;
  date: string;
}

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
    redirect: "follow" as RequestRedirect,
  };

  return requestOptions;
}

async function getUserId(userName: string) {
  const requestOptionsForTwitterAPI = setHeaderForTwitterAPI();

  const fetchUserInfo = await fetch(
    `https://twitter135.p.rapidapi.com/v2/UserByScreenName/?username=${userName}`,
    requestOptionsForTwitterAPI
  );
  const userInfo = await fetchUserInfo.json();
  return userInfo?.data?.user?.result?.rest_id;
}

async function getUserTweets(userID: string) {
  const requestOptionsForTwitterAPI = setHeaderForTwitterAPI();
  const getUserTweets = await fetch(
    `https://twitter135.p.rapidapi.com/v2/UserTweets/?id=${userID}&count=40`,
    requestOptionsForTwitterAPI
  );
  let userTweets = await getUserTweets.json();
  userTweets =
    userTweets?.data?.user?.result?.timeline_v2?.timeline.instructions;

  for(let currentUserTweets of userTweets) {
    if(currentUserTweets?.type === "TimelineAddEntries") {
      userTweets = currentUserTweets?.entries;
      break;
    }
  }

  const parsingUserTweets: TweetsObject[] = userTweets
    .filter((tweet: any) => {
      const tweetData =
        tweet?.content?.itemContent?.tweet_results?.result?.legacy;

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
      const tweetData =
        tweet?.content?.itemContent?.tweet_results?.result?.legacy;

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
  return await getUserTweets(userId);
}
