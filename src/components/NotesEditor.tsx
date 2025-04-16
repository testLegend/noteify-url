
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Edit3, Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Bold, Italic, Link, Code } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import parse from 'html-react-parser';

interface NotesEditorProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ content, onSave, onCancel }) => {
  const [editMode, setEditMode] = useState<'visual' | 'html'>('visual');
  const [editableContent, setEditableContent] = useState(content);
  const [previewContent, setPreviewContent] = useState(content);
  const { toast } = useToast();
  
  // Initialize preview content when the component mounts or content changes
  useEffect(() => {
    setPreviewContent(editableContent);
  }, [editableContent]);
  
  const handleSave = () => {
    onSave(editableContent);
    toast({
      title: "Changes saved",
      description: "Your notes have been updated",
    });
  };
  
  const insertFormatting = (tag: string, attributes: string = '') => {
    // For HTML mode
    if (editMode === 'html') {
      const textarea = document.querySelector('textarea');
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editableContent.substring(start, end);
      
      const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`;
      const closeTag = `</${tag}>`;
      
      const newContent = 
        editableContent.substring(0, start) + 
        openTag + 
        selectedText + 
        closeTag + 
        editableContent.substring(end);
      
      setEditableContent(newContent);
      
      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + openTag.length + selectedText.length + closeTag.length,
          start + openTag.length + selectedText.length + closeTag.length
        );
      }, 0);
    }
  };

  const formatButtons = [
    { icon: <Heading1 className="h-4 w-4" />, label: "Heading 1", action: () => insertFormatting('h1') },
    { icon: <Heading2 className="h-4 w-4" />, label: "Heading 2", action: () => insertFormatting('h2') },
    { icon: <Heading3 className="h-4 w-4" />, label: "Heading 3", action: () => insertFormatting('h3') },
    { icon: <Bold className="h-4 w-4" />, label: "Bold", action: () => insertFormatting('strong') },
    { icon: <Italic className="h-4 w-4" />, label: "Italic", action: () => insertFormatting('em') },
    { icon: <List className="h-4 w-4" />, label: "Bullet List", action: () => insertFormatting('ul') },
    { icon: <ListOrdered className="h-4 w-4" />, label: "Numbered List", action: () => insertFormatting('ol') },
    { icon: <Quote className="h-4 w-4" />, label: "Quote", action: () => insertFormatting('blockquote') },
    { icon: <Code className="h-4 w-4" />, label: "Code", action: () => insertFormatting('code') },
    { icon: <Link className="h-4 w-4" />, label: "Link", action: () => insertFormatting('a', 'href="#"') },
  ];
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Edit Notes</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="space-y-4">
          <Card className="p-4 overflow-hidden">
            <div className="flex gap-1 flex-wrap mb-3 p-1 border-b">
              <div className="flex items-center mr-2">
                <Button
                  variant={editMode === 'visual' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode('visual')}
                  className="rounded-r-none"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Visual
                </Button>
                <Button
                  variant={editMode === 'html' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditMode('html')}
                  className="rounded-l-none"
                >
                  <Type className="h-4 w-4 mr-1" />
                  HTML
                </Button>
              </div>
              
              {editMode === 'html' && formatButtons.map((button, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  title={button.label}
                >
                  {button.icon}
                </Button>
              ))}
            </div>
            
            <Textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm resize-y"
              placeholder="Edit your notes here..."
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card className="overflow-hidden shadow-lg">
            <div className="p-6">
              <div id="preview-content" className="note-content prose prose-slate prose-headings:font-bold prose-headings:mt-6 prose-headings:mb-4 prose-p:my-3 prose-li:my-1 prose-blockquote:bg-blue-50 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:my-4 prose-blockquote:rounded-r prose-strong:text-blue-800 prose-hr:my-6 prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm max-w-none">
                {parse(previewContent)}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotesEditor;
