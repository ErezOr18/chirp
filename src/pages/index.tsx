import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import { PostView } from "../components/PostView";
import toast from "react-hot-toast";

const CreatePostWizard = () => {
  const [userInput, setUserInput] = useState("");

  const ctx = api.useContext();
  const { user } = useUser();
  const { mutate, isLoading: isPosting } = api.post.createPost.useMutation({
    onSuccess: () => {
      setUserInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("error trying to post.");
      }
    },
  });
  if (!user) return null;
  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="flex h-16 w-16 rounded-full"
        width={64}
        height={64}
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();

            if (userInput !== "") {
              mutate({ content: userInput });
            }
          }
        }}
      />
      {userInput !== "" && !isPosting && (
        <button onClick={() => mutate({ content: userInput })}>Post</button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: isPostsLoading } = api.post.getAll.useQuery();

  if (isPostsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong...</div>;

  return (
    <div className="flex flex-col gap-3">
      {data.map((postWithAuthor) => (
        <PostView {...postWithAuthor} key={postWithAuthor.post.id} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();
  api.post.getAll.useQuery();

  if (!isUserLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className="border-slate-2000 h-full w-full border-x md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {isSignedIn && (
              <div className="flex justify-center">
                <CreatePostWizard />
              </div>
            )}
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
          </div>

          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
