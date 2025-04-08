import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isBot ? "bg-gray-200" : "bg-blue-500 text-white"
        }`}
      >
        {isBot ? (
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              h3: ({ node, ...props }) => (
                <h3 className="mb-2 text-lg font-bold" {...props} />
              ),
              p: ({ node, ...props }) => <p className="mb-2" {...props} />,
              ul: ({ node, ...props }) => (
                <ul className="mb-2 ml-4 list-disc" {...props} />
              ),
              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="my-2 border-l-4 border-blue-500 pl-2 text-gray-600"
                  {...props}
                />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-2 border-gray-300" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto">
                  <table
                    className="min-w-full border-collapse border border-gray-300"
                    {...props}
                  />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th
                  className="border border-gray-300 bg-gray-100 px-2 py-1"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-2 py-1" {...props} />
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        ) : (
          <span>{message.text}</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
