import { type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithAuthor = RouterOutputs["post"]["getAll"][number];
export const PostView = (props: PostWithAuthor) => {
  const { post, author } = props;
  return (
    <div
      key={post.id}
      className="flex gap-3 border-b border-slate-400 p-4 text-2xl"
    >
      <Image
        src={author.profileImageUrl}
        className=" flex h-12 w-12 rounded-full"
        alt="Author Profile"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 font-bold text-slate-300">
          <span>{`@${author.username}`}</span>
          <span className=" font-thin">{`   · ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};
