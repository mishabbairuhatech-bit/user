import { forwardRef, useRef, useState, useEffect } from 'react';
import { Upload, Trash2, FileText, Image, Film, FileSpreadsheet, File, X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Avatar, AvatarGroup } from './Avatar';
import { colors, colorClassToHex } from '@/config/colors';

// Size configurations
const sizeConfig = {
  sm: {
    dropzone: 'p-4',
    iconWrapper: 'w-8 h-8',
    icon: 'w-4 h-4',
    title: 'text-xs',
    subtitle: 'text-[10px]',
    button: 'px-2.5 py-1 text-xs',
    fileItem: 'p-2 gap-2',
    fileIcon: 'w-8 h-8',
    fileIconInner: 'w-3 h-3',
    fileLabel: 'text-[6px]',
    fileName: 'text-xs',
    fileSize: 'text-[10px]',
    progress: 'h-1',
    deleteBtn: 'p-1',
    deleteIcon: 'w-3 h-3',
  },
  md: {
    dropzone: 'p-6',
    iconWrapper: 'w-12 h-12',
    icon: 'w-6 h-6',
    title: 'text-sm',
    subtitle: 'text-xs',
    button: 'px-4 py-2 text-sm',
    fileItem: 'p-3 gap-3',
    fileIcon: 'w-10 h-10',
    fileIconInner: 'w-4 h-4',
    fileLabel: 'text-[8px]',
    fileName: 'text-sm',
    fileSize: 'text-xs',
    progress: 'h-1.5',
    deleteBtn: 'p-1.5',
    deleteIcon: 'w-4 h-4',
  },
  lg: {
    dropzone: 'p-8',
    iconWrapper: 'w-16 h-16',
    icon: 'w-8 h-8',
    title: 'text-base',
    subtitle: 'text-sm',
    button: 'px-5 py-2.5 text-base',
    fileItem: 'p-4 gap-4',
    fileIcon: 'w-12 h-12',
    fileIconInner: 'w-5 h-5',
    fileLabel: 'text-[10px]',
    fileName: 'text-base',
    fileSize: 'text-sm',
    progress: 'h-2',
    deleteBtn: 'p-2',
    deleteIcon: 'w-5 h-5',
  },
};

// Default file types configuration
const defaultFileTypes = [
  { id: 'image', icon: Image, color: 'bg-primary-500', name: 'Images' },
  { id: 'video', icon: Film, color: 'bg-danger-500', name: 'Videos' },
  { id: 'pdf', icon: FileText, color: 'bg-danger-500', name: 'PDF' },
  { id: 'doc', icon: FileText, color: 'bg-info-500', name: 'Documents' },
  { id: 'excel', icon: FileSpreadsheet, color: 'bg-success-500', name: 'Spreadsheets' },
  { id: 'file', icon: File, color: 'bg-gray-500', name: 'Other Files' },
];

const FileUpload = forwardRef(({
  label,
  accept,
  multiple = false,
  maxSize,
  maxFiles = 10,
  onUpload,
  onRemove,
  disabled = false,
  error,
  preview = true,
  avatarMax = 4,
  fileTypes, // Custom file types: [{ id, icon, color, name }]
  dragDrop = true,
  dragText = 'Drag files here to upload',
  subText,
  icon: CustomIcon,
  showSelectButton = true,
  selectButtonText = 'Select files',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  // Use custom fileTypes or default
  const displayFileTypes = fileTypes || defaultFileTypes;
  const sizes = sizeConfig[size] || sizeConfig.md;
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotate, setPreviewRotate] = useState(0);
  const inputRef = useRef(null);

  // Close preview on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && previewImage) {
        closePreview();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [previewImage]);

  const openPreview = (src, name) => {
    setPreviewImage({ src, name });
    setPreviewZoom(0.5);
    setPreviewRotate(0);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setPreviewZoom(1);
    setPreviewRotate(0);
  };

  const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setPreviewRotate(prev => (prev + 90) % 360);

  // File type icons and colors (using theme colors)
  const getFileConfig = (file) => {
    const type = file.type;
    const ext = file.name.split('.').pop().toLowerCase();

    if (type.startsWith('image/')) {
      return { icon: Image, color: 'bg-primary-500', label: ext.toUpperCase() };
    }
    if (type.startsWith('video/')) {
      return { icon: Film, color: 'bg-danger-500', label: ext.toUpperCase() };
    }
    if (ext === 'csv' || type.includes('csv')) {
      return { icon: FileSpreadsheet, color: 'bg-primary-500', label: 'CSV' };
    }
    if (ext === 'xlsx' || ext === 'xls' || type.includes('spreadsheet')) {
      return { icon: FileSpreadsheet, color: 'bg-success-500', label: ext.toUpperCase() };
    }
    if (ext === 'pdf' || type.includes('pdf')) {
      return { icon: FileText, color: 'bg-danger-500', label: 'PDF' };
    }
    if (ext === 'doc' || ext === 'docx' || type.includes('document')) {
      return { icon: FileText, color: 'bg-info-500', label: ext.toUpperCase() };
    }
    return { icon: File, color: 'bg-gray-500', label: ext.toUpperCase() };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }
    if (accept) {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      const isValid = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type.toLowerCase();
        }
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'));
        }
        return fileType === type;
      });

      if (!isValid) {
        return 'File type not accepted';
      }
    }
    return null;
  };

  const handleFiles = (newFiles) => {
    setUploadError(null);

    if (!multiple && newFiles.length > 1) {
      newFiles = [newFiles[0]];
    }

    if (multiple && files.length + newFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = [];
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }
      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        progress: 0,
      });
    }

    const updatedFiles = multiple ? [...files, ...validFiles] : validFiles;
    setFiles(updatedFiles);

    // Simulate upload progress
    updatedFiles.forEach((fileItem, index) => {
      if (fileItem.progress === 0) {
        simulateProgress(fileItem.id);
      }
    });

    onUpload && onUpload(updatedFiles.map(f => f.file));
  };

  const simulateProgress = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, progress: Math.min(progress, 100) } : f
      ));
    }, 200);
  };

  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (id) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onRemove && onRemove(fileToRemove?.file);
    onUpload && onUpload(updatedFiles.map(f => f.file));
  };

  const defaultSubText = subText || (maxSize ? `or, click to browse (${formatFileSize(maxSize)} max)` : 'or, click to browse');

  return (
    <div ref={ref} className={`w-full ${className}`} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-[rgba(255,255,255,0.75)] mb-2">
          {label}
        </label>
      )}

      {/* Dropzone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl ${sizes.dropzone}
          transition-all duration-200
          ${disabled ? 'bg-gray-50 dark:bg-[#2a2a2a] cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-300 dark:border-[#424242] hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'}
          ${error || uploadError ? 'border-danger-400 bg-danger-50 dark:bg-danger-500/10' : ''}
        `}
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={dragDrop ? handleDrop : undefined}
        onDragOver={dragDrop ? handleDragOver : undefined}
        onDragLeave={dragDrop ? handleDragLeave : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          {/* Icon - Show accepted file types as avatars or custom icon or default upload icon */}
          {CustomIcon ? (
            <div className="mb-3">{CustomIcon}</div>
          ) : accept ? (
            <div className="mb-3">
              {(() => {
                const acceptedTypes = accept.split(',').map(t => t.trim());
                const avatars = [];

                acceptedTypes.forEach((type) => {
                  const lowerType = type.toLowerCase();
                  if (lowerType.startsWith('image/') || lowerType === 'image/*') {
                    if (!avatars.find(a => a.id === 'image')) {
                      avatars.push({ id: 'image', icon: Image, color: 'bg-primary-500', name: 'Images' });
                    }
                  } else if (lowerType.startsWith('video/') || lowerType === 'video/*') {
                    if (!avatars.find(a => a.id === 'video')) {
                      avatars.push({ id: 'video', icon: Film, color: 'bg-danger-500', name: 'Videos' });
                    }
                  } else if (lowerType === '.csv' || lowerType.includes('csv')) {
                    if (!avatars.find(a => a.id === 'csv')) {
                      avatars.push({ id: 'csv', icon: FileSpreadsheet, color: 'bg-info-500', name: 'CSV' });
                    }
                  } else if (lowerType === '.xlsx' || lowerType === '.xls' || lowerType.includes('spreadsheet')) {
                    if (!avatars.find(a => a.id === 'excel')) {
                      avatars.push({ id: 'excel', icon: FileSpreadsheet, color: 'bg-success-500', name: 'Excel' });
                    }
                  } else if (lowerType === '.pdf' || lowerType.includes('pdf')) {
                    if (!avatars.find(a => a.id === 'pdf')) {
                      avatars.push({ id: 'pdf', icon: FileText, color: 'bg-danger-500', name: 'PDF' });
                    }
                  } else if (lowerType === '.doc' || lowerType === '.docx' || lowerType.includes('document') || lowerType.includes('word')) {
                    if (!avatars.find(a => a.id === 'doc')) {
                      avatars.push({ id: 'doc', icon: FileText, color: 'bg-warning-500', name: 'Document' });
                    }
                  } else if (lowerType.startsWith('.')) {
                    if (!avatars.find(a => a.id === lowerType)) {
                      avatars.push({ id: lowerType, icon: File, color: 'bg-gray-500', name: lowerType.toUpperCase() });
                    }
                  }
                });

                if (avatars.length === 0) {
                  return (
                    <div className={`${sizes.iconWrapper} rounded-full flex items-center justify-center ${isDragging ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-[#2a2a2a]'}`}>
                      <Upload className={`${sizes.icon} ${isDragging ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'}`} />
                    </div>
                  );
                }

                if (avatars.length === 1) {
                  return (
                    <Avatar
                      size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'}
                      icon={avatars[0].icon}
                      color={avatars[0].color}
                      name={avatars[0].name}
                      showTooltip
                      tooltipContent={avatars[0].name}
                    />
                  );
                }

                return (
                  <AvatarGroup
                    size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'}
                    max={avatarMax}
                    avatars={avatars}
                    showTooltip
                  />
                );
              })()}
            </div>
          ) : (
            <div className="mb-3">
              {displayFileTypes.length === 1 ? (
                <Avatar
                  size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'}
                  icon={displayFileTypes[0].icon}
                  color={displayFileTypes[0].color}
                  name={displayFileTypes[0].name}
                  showTooltip
                  tooltipContent={displayFileTypes[0].name}
                />
              ) : (
                <AvatarGroup
                  size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'}
                  max={avatarMax}
                  avatars={displayFileTypes}
                  showTooltip
                />
              )}
            </div>
          )}

          {/* Text */}
          <p className={`${sizes.title} font-medium text-gray-900 dark:text-[rgba(255,255,255,0.85)] mb-1`}>
            {dragText}
          </p>
          <p className={`${sizes.subtitle} text-gray-500 dark:text-[rgba(255,255,255,0.55)] mb-3`}>
            {defaultSubText}
          </p>

          {/* Select Button */}
          {showSelectButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={disabled}
              className={`${sizes.button} font-medium text-gray-700 dark:text-[rgba(255,255,255,0.85)] bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#424242] rounded-xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors`}
            >
              {selectButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {(error || uploadError) && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error || uploadError}</p>
      )}

      {/* File List Preview */}
      {preview && files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map((fileItem) => {
            const config = getFileConfig(fileItem.file);
            const FileIcon = config.icon;
            const isComplete = fileItem.progress >= 100;

            return (
              <div
                key={fileItem.id}
                className={`flex items-center ${sizes.fileItem} bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#424242] rounded-xl`}
              >
                {/* File Icon */}
                {fileItem.preview ? (
                  <div
                    className={`${sizes.fileIcon} relative cursor-pointer group`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(fileItem.preview, fileItem.file.name);
                    }}
                  >
                    <img
                      src={fileItem.preview}
                      alt={fileItem.file.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`${sizes.fileIcon} rounded-xl flex flex-col items-center justify-center`}
                    style={{ backgroundColor: colorClassToHex[config.color] || colors.primary[500] }}
                  >
                    <FileIcon className={`${sizes.fileIconInner} text-white`} />
                    <span className={`${sizes.fileLabel} text-white font-medium mt-0.5`}>{config.label}</span>
                  </div>
                )}

                {/* File Info & Progress */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`${sizes.fileName} font-medium text-gray-900 dark:text-[rgba(255,255,255,0.85)] truncate max-w-[75%]`}>
                      {fileItem.file.name}
                    </p>
                    <span className={`${sizes.fileSize} text-gray-400 dark:text-[rgba(255,255,255,0.45)] flex-shrink-0`}>
                      {formatFileSize(fileItem.file.size)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className={`flex-1 ${sizes.progress} bg-gray-100 dark:bg-[#424242] rounded-full overflow-hidden`}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${fileItem.progress}%`,
                          backgroundColor: isComplete ? colors.success[500] : colors.primary[500]
                        }}
                      />
                    </div>
                    <span className={`${sizes.fileSize} text-gray-500 dark:text-[rgba(255,255,255,0.55)] w-10 text-right`}>
                      {Math.round(fileItem.progress)}%
                    </span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  className={`${sizes.deleteBtn} text-gray-400 dark:text-gray-500 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-xl transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(fileItem.id);
                  }}
                >
                  <Trash2 className={sizes.deleteIcon} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={closePreview}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={closePreview}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2 animate-slide-down">
            <button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-white/80 text-sm min-w-[60px] text-center">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <div className="w-px h-5 bg-white/20 mx-1" />
            <button
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              onClick={(e) => { e.stopPropagation(); handleRotate(); }}
              title="Rotate"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[85vh] overflow-auto animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.src}
              alt={previewImage.name}
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
              style={{
                transform: `scale(${previewZoom}) rotate(${previewRotate}deg)`
              }}
            />
          </div>

          {/* File Name */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 animate-slide-up">
            <span className="text-white/80 text-sm">{previewImage.name}</span>
          </div>

          {/* Animation Styles */}
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes zoom-in {
              from { opacity: 0; transform: scale(0.3); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes slide-down {
              from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            @keyframes slide-up {
              from { opacity: 0; transform: translateX(-50%) translateY(20px); }
              to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.2s ease-out; }
            .animate-zoom-in { animation: zoom-in 0.3s ease-out; }
            .animate-slide-down { animation: slide-down 0.3s ease-out; }
            .animate-slide-up { animation: slide-up 0.3s ease-out; }
          `}</style>
        </div>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;
