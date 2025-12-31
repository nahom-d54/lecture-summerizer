import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, FileAudio, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { recordingsApi } from '@/lib/api';

const ALLOWED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/webm'];
const MAX_SIZE_MB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function AudioUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => recordingsApi.upload(file, setUploadProgress),
    onSuccess: response => {
      const recordingId = response.data?.data?.id;
      if (recordingId) {
        navigate(`/recordings/${recordingId}`);
      }
    },
    // biome-ignore lint/suspicious/noExplicitAny: Error handling
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Upload failed');
    },
  });

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return 'Invalid format. Supported: MP3, WAV, M4A, WEBM';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size: ${MAX_SIZE_MB}MB`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      setError('');
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setFile(file);
    },
    [validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            role="button"
            tabIndex={0}
            onDragOver={e => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your audio file here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports MP3, WAV, M4A, WEBM (max {MAX_SIZE_MB}MB)
            </p>
            <label>
              <input
                type="file"
                accept={ALLOWED_FORMATS.join(',')}
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button variant="outline" asChild>
                <span>Browse files</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileAudio className="h-8 w-8 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              {!uploadMutation.isPending && (
                <Button variant="ghost" size="icon" onClick={handleClear}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-gray-500">Uploading... {uploadProgress}%</p>
              </div>
            )}

            {uploadMutation.isSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Upload complete! Redirecting...</span>
              </div>
            )}

            {!uploadMutation.isPending && !uploadMutation.isSuccess && (
              <Button onClick={handleUpload} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload and Process
              </Button>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 mt-4 p-3 text-red-600 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
