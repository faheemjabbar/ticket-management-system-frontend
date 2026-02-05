'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { uploadAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete: (file: UploadedFile) => void;
  onRemove?: (fileId: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  existingFiles?: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export function FileUpload({
  onUploadComplete,
  onRemove,
  maxSize = 10,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt',
  multiple = false,
  existingFiles = [],
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0]; // Handle single file for now

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadedFile = await uploadAPI.upload(file, (progress) => {
        setUploadProgress(progress);
      });

      onUploadComplete(uploadedFile);
      toast.success('File uploaded successfully!');
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = async (fileId: string) => {
    try {
      await uploadAPI.delete(fileId);
      if (onRemove) {
        onRemove(fileId);
      }
      toast.success('File removed');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove file');
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    } else if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drag and drop files here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500">
              Max file size: {maxSize}MB
            </p>
          </>
        )}
      </div>

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Attached Files:</p>
          {existingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
                >
                  View
                </a>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
