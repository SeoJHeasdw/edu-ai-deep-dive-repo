'use client';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>업로드된 파일 ({files.length})</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div
            key={index}
            className="group relative flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {file.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 px-2 py-0.5 rounded">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              onClick={() => removeFile(index)}
              className="ml-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors opacity-70 hover:opacity-100"
              title="파일 제거"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

