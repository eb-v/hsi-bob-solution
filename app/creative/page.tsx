'use client';

import { useEffect, useState, DragEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import PageLayout from '@/app/components/PageLayout';

// Your demo result lives at /public/creative-demo-flyer.png
const DEMO_IMAGE_SRC = '/creative-demo-flyer.png';

export default function CreativePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [fileLabel, setFileLabel] = useState<string | null>(null);

  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [originalIsImage, setOriginalIsImage] = useState<boolean>(false);

  // Revoke object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (originalSrc?.startsWith('blob:')) URL.revokeObjectURL(originalSrc);
    };
  }, [originalSrc]);

  const handleFile = (file: File) => {
    setFileLabel(file.name);
    const isImg = file.type.startsWith('image/');
    setOriginalIsImage(isImg);

    if (originalSrc?.startsWith('blob:')) URL.revokeObjectURL(originalSrc);
    const url = URL.createObjectURL(file);
    setOriginalSrc(url);
    setShowResult(true);
  };

  const onDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    if (originalSrc?.startsWith('blob:')) URL.revokeObjectURL(originalSrc);
    setShowResult(false);
    setFileLabel(null);
    setOriginalSrc(null);
    setOriginalIsImage(false);
  };

  return (
    <PageLayout title="Creative and Experience">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Intro */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Creative Uploader (MVP)</h2>
          <p className="text-gray-400">
            Drop in any file. For this MVP demo, we always show the same improved mock design on the right.
          </p>
        </div>

        {/* Upload & Result */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload card */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Upload your creative</h3>

            <label
              htmlFor="creative-upload"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={[
                'flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-colors cursor-pointer',
                isDragging ? 'border-green-500 bg-gray-900/60' : 'border-gray-600 bg-gray-900',
                'hover:border-green-500',
              ].join(' ')}
            >
              <input
                id="creative-upload"
                type="file"
                className="hidden"
                onChange={onFileChange}
                aria-label="Upload creative file"
              />
              <div className="text-center">
                <p className="text-white font-semibold">
                  {isDragging ? 'Drop to upload' : 'Drag & drop your file here'}
                </p>
                <p className="text-gray-400 text-sm mt-1">or click to select a file</p>
                {fileLabel && (
                  <p className="text-gray-300 text-xs mt-3">
                    Selected: <span className="font-mono">{fileLabel}</span>
                  </p>
                )}
              </div>
            </label>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                disabled={!showResult && !fileLabel}
              >
                Reset
              </button>
              <span className="text-xs text-gray-500">
                Any file works — the right side shows a fixed demo result.
              </span>
            </div>
          </div>

          {/* Side-by-side: Original vs Demo */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Generated Preview</h3>
              {!showResult && <span className="text-xs text-gray-400">No file uploaded yet</span>}
            </div>

            {showResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Preview */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-sm mb-2">Original</p>
                  <div className="relative w-full" style={{ aspectRatio: '3 / 4' }}>
                    {originalIsImage && originalSrc ? (
                      <Image
                        src={originalSrc}
                        alt="Original upload preview"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain rounded-md"
                        // unoptimized helps with blob: URLs
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center rounded-md bg-gray-800 text-center px-4">
                        <div>
                          <div className="text-gray-500 text-4xl mb-2">📄</div>
                          <p className="text-gray-300 text-sm">Preview not available</p>
                          {fileLabel && (
                            <p className="text-gray-500 text-xs mt-1 truncate">
                              {fileLabel}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demo Enhanced */}
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                  <p className="text-gray-400 text-sm mb-2">Enhanced (demo)</p>
                  <div className="relative w-full" style={{ aspectRatio: '3 / 4' }}>
                    <Image
                      src={DEMO_IMAGE_SRC}
                      alt="Improved creative (demo)"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain rounded-md"
                      priority
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 rounded-lg bg-gray-900 border border-gray-700 grid place-items-center">
                <p className="text-gray-500 text-sm">Upload a file to see side-by-side preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
