'use client';

import { Message } from './ChatInterface';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 mr-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/30'
            : 'bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50'
        }`}
      >
        {/* 메시지 내용 - AI 응답은 항상 Markdown 렌더링 */}
        {!isUser ? (
          <div className="prose prose-sm dark:prose-invert max-w-none markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 테이블 스타일링
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border border-gray-300 dark:border-gray-600" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="px-3 py-2 text-left text-xs font-semibold bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-500" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600" {...props} />
                ),
                // 코드 블록
                code: ({ node, inline, ...props }: any) => (
                  inline ? (
                    <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 font-mono text-sm" {...props} />
                  ) : (
                    <code className="block p-3 rounded-lg bg-gray-900 text-gray-100 overflow-x-auto font-mono text-sm my-2" {...props} />
                  )
                ),
                // 헤더
                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-white" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-2 mb-1 text-gray-900 dark:text-white" {...props} />,
                // 리스트
                ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,
                // 단락
                p: ({ node, ...props }) => <p className="my-2" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {message.content}
          </div>
        )}

        {/* 파일 정보 */}
        {message.files && message.files.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/20 space-y-1">
            {message.files.map((file, idx) => (
              <div key={idx} className="text-xs opacity-80 flex items-center space-x-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>{file.name}</span>
                <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        )}

        {/* 사용된 도구 */}
        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <div className="text-xs opacity-70 flex items-center space-x-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>도구: {message.toolsUsed.join(', ')}</span>
            </div>
          </div>
        )}

        {/* Frontmatter 파일 다운로드 */}
        {message.frontmatterFile && (
          <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(`http://localhost:8000${message.frontmatterFile!.download_url}`);
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = message.frontmatterFile!.filename;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                } catch (error) {
                  console.error('다운로드 실패:', error);
                  alert('파일 다운로드에 실패했습니다.');
                }
              }}
              className="text-xs flex items-center space-x-2 hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Frontmatter 파일 다운로드</span>
              <span className="opacity-70">({(message.frontmatterFile.size / 1024).toFixed(1)} KB)</span>
            </button>
          </div>
        )}

        {/* 타임스탬프 */}
        <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
}

