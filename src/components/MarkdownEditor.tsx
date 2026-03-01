import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, Bold, Italic, Link as LinkIcon, Heading1, Heading2, List, Code } from "lucide-react";
import { adminService } from "@/services/adminService";
import { compressAndEncodeImage } from "@/lib/imageCompress";
import { markdownToHtml } from "@/lib/markdown";

interface ImageMap {
  [key: string]: string; // maps short ID to actual URL
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (imageUrl: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onImageUpload,
}) => {
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [imageMap, setImageMap] = useState<ImageMap>({});
  const [imageCounter, setImageCounter] = useState(1);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressedBase64 = await compressAndEncodeImage(file);
      const result = await adminService.uploadImage(compressedBase64);

      if (result.success && result.data?.url) {
        const shortId = `img:${String(imageCounter).padStart(3, "0")}`;
        const newImageMap = { ...imageMap, [shortId]: result.data.url };
        setImageMap(newImageMap);
        setImageCounter(imageCounter + 1);

        const markdownImage = `![${file.name}](${shortId})`;
        onChange(value + (value && !value.endsWith("\n") ? "\n\n" : "\n") + markdownImage);
        onImageUpload?.(result.data.url);
      }

      setUploading(false);
    } catch (error) {
      console.error("Failed to upload image:", error);
      setUploading(false);
    }
  };

  // Convert image IDs in markdown to actual URLs for preview
  const resolveImageUrls = (markdown: string): string => {
    let resolved = markdown;
    Object.entries(imageMap).forEach(([id, url]) => {
      resolved = resolved.replace(new RegExp(`\\(${id}\\)`, "g"), `(${url})`);
    });
    return resolved;
  };

  const insertMarkdown = (before: string, after = "") => {
    const textarea = document.getElementById("markdown-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || "text";
    const newValue =
      value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd = start + before.length + selectedText.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-0 w-full">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide mr-3">Edit</Label>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("**", "**")}
              title="Bold (Cmd+B)"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <Bold className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("*", "*")}
              title="Italic (Cmd+I)"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <Italic className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("# ", "")}
              title="Heading 1"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <Heading1 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("## ", "")}
              title="Heading 2"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <Heading2 className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("- ", "")}
              title="Bullet list"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <List className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("`", "`")}
              title="Code"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <Code className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("[", "](url)")}
              title="Link"
              className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            <label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                asChild
                disabled={uploading}
                className="hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200"
              >
                <span>
                  <ImagePlus className="h-4 w-4" />
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {uploading && <span className="text-xs text-slate-500">Uploading...</span>}
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs"
          >
            {showPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-t-0 border-slate-200 dark:border-slate-700 min-h-[800px] bg-white dark:bg-slate-950 overflow-hidden">
          {/* Editor Side */}
          <div className="border-r border-slate-200 dark:border-slate-700 overflow-auto">
            <Textarea
              id="markdown-editor"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Start writing your story...

Use **bold** and *italic* text
# Heading 1
## Heading 2

- Bullet points
- Another point

[Link text](url)

Click image button to upload photos"
              className="w-full h-full font-mono text-base sm:text-lg border-0 rounded-none resize-none focus:outline-none p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              style={{
                fontFamily: "'Menlo', 'Monaco', monospace",
              }}
            />
          </div>

          {/* Preview Side */}
          <div className="overflow-auto bg-white dark:bg-slate-950 p-12">
            <div className="max-w-none prose prose-lg dark:prose-invert select-none pointer-events-none">
              <div
                dangerouslySetInnerHTML={{ __html: markdownToHtml(resolveImageUrls(value)) }}
                className="text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-t-0 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-12 min-h-[800px] overflow-auto">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{ __html: markdownToHtml(resolveImageUrls(value)) }}
              className="text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-slate-600 dark:text-slate-400 p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <strong>Markdown tips:</strong> Use **bold**, *italic*, # heading, - list, [link](url), ![image](url)
      </div>
    </div>
  );
};

export default MarkdownEditor;
