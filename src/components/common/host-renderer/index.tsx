import { useDomain } from "@/hooks/global/use-domain";

type Props = {
  content: string;
  replace?: string;
};

const HostRenderer = ({ content, replace = "302.AI" }: Props) => {
  const domain = useDomain();
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  return (
    <>
      {content.split(" ").map((word, index) => (
        <span key={index}>
          {urlPattern.test(word) || word === replace ? (
            <a
              href={word === replace ? domain : word}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {replace}{" "}
            </a>
          ) : (
            word
          )}{" "}
        </span>
      ))}
    </>
  );
};

export default HostRenderer;
