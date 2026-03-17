"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  ListOrdered
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Markdown কন্টেন্ট লিখুন...",
  rows = 15,
  className = ""
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newValue);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-muted rounded-t-lg border border-b-0">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("# ")}
            title="বড় হেডিং"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("## ")}
            title="মাঝারি হেডিং"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("### ")}
            title="ছোট হেডিং"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("**", "**")}
            title="বোল্ড"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("*", "*")}
            title="ইটালিক"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("`", "`")}
            title="ইনলাইন কোড"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("- ")}
            title="আনঅর্ডার লিস্ট"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("1. ")}
            title="অর্ডার লিস্ট"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("> ")}
            title="কোটেশন"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("[", "](url)")}
            title="লিংক"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMarkdown("![alt text](", ")")}
            title="ইমেজ"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`font-mono text-sm border-t-0 rounded-t-none ${className}`}
      />

      {/* Markdown Help */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
        <p className="font-medium mb-2">Markdown ফরম্যাট গাইড:</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p><code className="bg-muted px-1 rounded"># হেডিং</code> - বড় হেডিং</p>
            <p><code className="bg-muted px-1 rounded">## হেডিং</code> - মাঝারি হেডিং</p>
            <p><code className="bg-muted px-1 rounded">**বোল্ড**</code> - বোল্ড টেক্সট</p>
            <p><code className="bg-muted px-1 rounded">*ইটালিক*</code> - ইটালিক টেক্সট</p>
          </div>
          <div>
            <p><code className="bg-muted px-1 rounded">`কোড`</code> - ইনলাইন কোড</p>
            <p><code className="bg-muted px-1 rounded">- আইটেম</code> - আনঅর্ডার লিস্ট</p>
            <p><code className="bg-muted px-1 rounded">1. আইটেম</code> - অর্ডার লিস্ট</p>
            <p><code className="bg-muted px-1 rounded">&gt; কোটেশন</code> - কোটেশন</p>
          </div>
        </div>
      </div>
    </div>
  );
}