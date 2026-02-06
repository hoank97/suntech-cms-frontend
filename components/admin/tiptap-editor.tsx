'use client';

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import StarterKit from '@tiptap/starter-kit';
import Link, { LinkOptions } from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Plugin, PluginKey } from 'prosemirror-state';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import { Node, Extension, Editor } from '@tiptap/core';

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Image as ImageIcon,
    Quote,
    Code,
    Undo,
    Redo,
    Table as TableIcon,
    Trash2,
    Plus,
    Split,
    Merge,
    ChevronDown,
    Check,
    X,
    Minus,
    Palette,
    Eye,
    EyeOff,
    MoveVertical,
    Type,
    ExternalLink,
    Pencil,
    Unlink as UnlinkIcon,
} from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { APIS } from '@/api/const';
import { useToast } from '@/hooks/use-toast';

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
    const isTableActive = editor && (editor.isActive('table') || editor.can().deleteTable());
    const isHrActive = editor && editor.isActive('horizontalRule');
    const isImageActive = editor && editor.isActive('image');
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [isColorOpen, setIsColorOpen] = useState(false);
    const [isLineHeightOpen, setIsLineHeightOpen] = useState(false);
    const [isHrColorOpen, setIsHrColorOpen] = useState(false);
    const [isHrToolbarOpen, setIsHrToolbarOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [hrSettings, setHrSettings] = useState({
        color: '#e0e0e0',
        width: '100%',
        height: '2px',
        alignment: 'center',
    });

    useEffect(() => {
        if (isHrActive && editor) {
            const attrs = editor.getAttributes('horizontalRule');
            setHrSettings({
                color: attrs.color || '#e0e0e0',
                width: attrs.width || '100%',
                height: attrs.height || '2px',
                alignment: attrs.alignment || 'center',
            });
        }
    }, [isHrActive, editor]);

    const updateHrSetting = (updates: Partial<typeof hrSettings>) => {
        setHrSettings(prev => {
            const newSettings = { ...prev, ...updates };
            if (isHrActive && editor) {
                editor.chain().focus().updateAttributes('horizontalRule', newSettings).run();
            }
            return newSettings;
        });
    };

    const { toast } = useToast();


    const fileInputRef = useRef<HTMLInputElement>(null);

    const addImage = useCallback(() => {
        fileInputRef?.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editor) return;
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Assuming the port is 3003 based on context, user said 300 which is likely a typo.
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${APIS.UPLOAD()}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('suntech-x-atk')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Assuming the API returns { url: '...' } or verify with user if it fails
            if (data.id) {
                editor.chain().focus().setImage({ src: `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${data.id}` }).run();
            } else if (typeof data === 'string') {
                editor.chain().focus().setImage({ src: `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}/${data}` }).run();
            } else {
                toast({
                    title: 'Error',
                    description: 'Invalid response from upload server',
                    variant: 'destructive',
                })
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: 'Error',
                description: 'Error uploading image',
                variant: 'destructive',
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [editor]);

    const openLinkMenu = useCallback(() => {
        if (isLinkOpen) {
            setIsLinkOpen(false);
            return;
        }

        if (!editor) return;

        const previousUrl = editor.getAttributes('link').href;
        // Get selected text or current text at cursor if inside a link
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');

        setLinkUrl(previousUrl || '');
        setLinkText(text || '');
        setIsLinkOpen(true);
    }, [editor, isLinkOpen]);

    const saveLink = useCallback(() => {
        if (!editor) return;
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsLinkOpen(false);
            return;
        }

        const linkAttributes = {
            href: linkUrl,
            target: '_blank',
        };

        if (linkText) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink(linkAttributes)
                .command(({ tr }: any) => {
                    tr.insertText(linkText);
                    return true;
                })
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink(linkAttributes).run();
        }

        setIsLinkOpen(false);
    }, [editor, linkUrl, linkText]);

    const removeLink = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setIsLinkOpen(false);
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <>
            <div className="border-b border-border bg-secondary p-2 flex flex-wrap gap-1 sticky top-0 z-50 rounded-t-md">
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('bold') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Bold"
                        type="button"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('italic') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Italic"
                        type="button"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={!editor.can().chain().focus().toggleUnderline().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('underline') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Underline"
                        type="button"
                    >
                        <UnderlineIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        disabled={!editor.can().chain().focus().toggleStrike().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('strike') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Strike"
                        type="button"
                    >
                        <Strikethrough className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('heading', { level: 1 }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Heading 1"
                        type="button"
                    >
                        <Heading1 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('heading', { level: 2 }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Heading 2"
                        type="button"
                    >
                        <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('heading', { level: 3 }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Heading 3"
                        type="button"
                    >
                        <Heading3 className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <div className="relative group">
                        <button
                            onClick={() => setIsColorOpen(!isColorOpen)}
                            className={cn(
                                "p-2 rounded hover:bg-background transition-colors",
                                editor.getAttributes('textStyle').color ? 'bg-background text-primary' : 'text-muted-foreground'
                            )}
                            title="Text Color"
                            type="button"
                        >
                            <Palette className="w-4 h-4" style={{ color: editor.getAttributes('textStyle').color }} />
                        </button>
                        {isColorOpen && (
                            <div className="absolute top-full left-0 z-50 pt-1">
                                <div className="bg-popover border border-border rounded shadow-md p-2 flex flex-col gap-2 w-48">
                                    <div className="grid grid-cols-5 gap-1">
                                        {/* Project Colors */}
                                        <button
                                            onClick={() => { editor.chain().focus().setColor('#086799').run(); setIsColorOpen(false); }}
                                            className="w-6 h-6 rounded border border-border"
                                            style={{ backgroundColor: '#086799' }}
                                            title="Project Blue #086799"
                                        />
                                        <button
                                            onClick={() => { editor.chain().focus().setColor('#f37440').run(); setIsColorOpen(false); }}
                                            className="w-6 h-6 rounded border border-border"
                                            style={{ backgroundColor: '#f37440' }}
                                            title="Project Orange #f37440"
                                        />
                                        {/* Standard Colors */}
                                        <button onClick={() => { editor.chain().focus().setColor('#000000').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-black" title="Black" />
                                        <button onClick={() => { editor.chain().focus().setColor('#4b5563').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-gray-600" title="Gray" />
                                        <button onClick={() => { editor.chain().focus().setColor('#dc2626').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-red-600" title="Red" />
                                        <button onClick={() => { editor.chain().focus().setColor('#2563eb').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-blue-600" title="Blue" />
                                        <button onClick={() => { editor.chain().focus().setColor('#16a34a').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-green-600" title="Green" />
                                        <button onClick={() => { editor.chain().focus().setColor('#ca8a04').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-yellow-600" title="Yellow" />
                                        <button onClick={() => { editor.chain().focus().setColor('#9333ea').run(); setIsColorOpen(false); }} className="w-6 h-6 rounded border border-border bg-purple-600" title="Purple" />
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="color"
                                            className="h-8 w-full cursor-pointer"
                                            onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                                            value={editor.getAttributes('textStyle').color || '#000000'}
                                        />
                                        <button
                                            onClick={() => { editor.chain().focus().unsetColor().run(); setIsColorOpen(false); }}
                                            className="text-xs px-2 py-1 border border-border rounded hover:bg-accent"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive({ textAlign: 'left' }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Align Left"
                        type="button"
                    >
                        <AlignLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive({ textAlign: 'center' }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Align Center"
                        type="button"
                    >
                        <AlignCenter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive({ textAlign: 'right' }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Align Right"
                        type="button"
                    >
                        <AlignRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive({ textAlign: 'justify' }) ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Align Justify"
                        type="button"
                    >
                        <AlignJustify className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-border mx-1" />

                    <div className="relative group">
                        <button
                            onClick={() => {
                                setIsLineHeightOpen(!isLineHeightOpen);
                                setIsLinkOpen(false); // Close others
                                setIsColorOpen(false);
                            }}
                            className={cn(
                                "p-2 rounded hover:bg-background transition-colors relative",
                                isLineHeightOpen ? 'bg-background text-primary' : 'text-muted-foreground'
                            )}
                            title="Line Height"
                            type="button"
                        >
                            <MoveVertical className="w-4 h-4" />
                        </button>
                        {isLineHeightOpen && (
                            <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded shadow-lg p-1 min-w-[120px] z-50 flex flex-col gap-1">
                                <button
                                    onClick={() => {
                                        editor.chain().focus().unsetLineHeight().run();
                                        setIsLineHeightOpen(false);
                                    }}
                                    className="text-xs px-2 py-1 hover:bg-accent text-left rounded w-full"
                                    type="button"
                                >
                                    Default
                                </button>
                                {['1', '1.15', '1.5', '2.0', '2.5', '3'].map((height) => (
                                    <button
                                        key={height}
                                        onClick={() => {
                                            editor.chain().focus().setLineHeight(height).run();
                                            setIsLineHeightOpen(false);
                                        }}
                                        className="text-xs px-2 py-1 hover:bg-accent text-left rounded w-full"
                                        type="button"
                                    >
                                        {height}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('bulletList') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Bullet List"
                        type="button"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('orderedList') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Ordered List"
                        type="button"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <div className="relative group">
                        <button
                            onClick={openLinkMenu}
                            className={cn(
                                "p-2 rounded hover:bg-background transition-colors",
                                editor.isActive('link') ? 'bg-background text-primary' : 'text-muted-foreground'
                            )}
                            title="Link"
                            type="button"
                        >
                            <LinkIcon className="w-4 h-4" />
                        </button>
                        {isLinkOpen && (
                            <div className="absolute top-full left-0 z-50 w-64 pt-1">
                                <div className="bg-popover border border-border rounded shadow-md p-2 flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Text"
                                        className="w-full px-2 py-1 text-sm border border-input rounded bg-background"
                                        value={linkText}
                                        onChange={(e) => setLinkText(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="URL"
                                        className="w-full px-2 py-1 text-sm border border-input rounded bg-background"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                    />
                                    <div className="flex gap-1 justify-end">
                                        <button
                                            onClick={removeLink}
                                            className="p-1 hover:bg-accent rounded text-destructive"
                                            title="Remove Link"
                                            type="button"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setIsLinkOpen(false)}
                                            className="p-1 hover:bg-accent rounded text-muted-foreground"
                                            title="Cancel"
                                            type="button"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={saveLink}
                                            className="p-1 hover:bg-accent rounded text-primary"
                                            title="Save"
                                            type="button"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={addImage}
                        className="p-2 rounded hover:bg-background transition-colors text-muted-foreground"
                        title="Image"
                        type="button"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        className="p-2 rounded hover:bg-background transition-colors text-muted-foreground"
                        title="Insert Table"
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <TableIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <button
                        onClick={() => {
                            setIsHrToolbarOpen(!isHrToolbarOpen);
                        }}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            isHrToolbarOpen || isHrActive ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Insert Horizontal Rule"
                        type="button"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('blockquote') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Blockquote"
                        type="button"
                    >
                        <Quote className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={cn(
                            "p-2 rounded hover:bg-background transition-colors",
                            editor.isActive('codeBlock') ? 'bg-background text-primary' : 'text-muted-foreground'
                        )}
                        title="Code Block"
                        type="button"
                    >
                        <Code className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().chain().focus().undo().run()}
                        className="p-2 rounded hover:bg-background transition-colors text-muted-foreground disabled:opacity-50"
                        title="Undo"
                        type="button"
                    >
                        <Undo className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().chain().focus().redo().run()}
                        className="p-2 rounded hover:bg-background transition-colors text-muted-foreground disabled:opacity-50"
                        title="Redo"
                        type="button"
                    >
                        <Redo className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Table Operations Toolbar - Only show when table is active */}
            {isTableActive && (
                <div className="border-b border-border bg-secondary px-2 py-1.5 flex flex-wrap gap-1">
                    <span className="text-xs font-medium text-muted-foreground self-center mr-2">Table:</span>

                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        + Col Before
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        + Col After
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (!editor.chain().focus().deleteColumn().run()) {
                                editor.chain().focus().deleteTable().run();
                            }
                        }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-destructive disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        Delete Col
                    </button>
                    <div className="w-px h-4 bg-border self-center mx-1" />
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        + Row Before
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        + Row After
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (!editor.chain().focus().deleteRow().run()) {
                                editor.chain().focus().deleteTable().run();
                            }
                        }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-destructive disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        Delete Row
                    </button>
                    <div className="w-px h-4 bg-border self-center mx-1" />
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().mergeCells().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50"
                        disabled={!editor.can().mergeCells()}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        Merge Cells
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().splitCell().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50"
                        disabled={!editor.can().splitCell()}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        Split Cell
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-destructive disabled:opacity-50"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        Delete Table
                    </button>
                    <div className="w-px h-4 bg-border self-center mx-1" />
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const currentNoBorder = editor.getAttributes('table').noBorder;
                            editor.chain().focus().updateAttributes('table', { noBorder: !currentNoBorder }).run();
                        }}
                        className="text-xs px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded disabled:opacity-50 flex items-center gap-1"
                        disabled={!isTableActive}
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {editor.getAttributes('table').noBorder ? <><Eye className="w-3 h-3" /> Show Border</> : <><EyeOff className="w-3 h-3" /> Hide Border</>}
                    </button>

                </div>
            )}

            {(isHrActive || isHrToolbarOpen) && (
                <div className="border-b border-border bg-secondary px-2 py-1.5 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-medium text-muted-foreground">Line:</span>

                    {/* Color swatches */}
                    <div className="flex gap-1 items-center">
                        <button onClick={() => updateHrSetting({ color: '#086799' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#086799' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#086799' }} title="Project Blue" type="button" />
                        <button onClick={() => updateHrSetting({ color: '#f37440' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#f37440' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#f37440' }} title="Project Orange" type="button" />
                        <button onClick={() => updateHrSetting({ color: '#000000' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#000000' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#000000' }} title="Black" type="button" />
                        <button onClick={() => updateHrSetting({ color: '#4b5563' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#4b5563' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#4b5563' }} title="Gray" type="button" />
                        <button onClick={() => updateHrSetting({ color: '#dc2626' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#dc2626' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#dc2626' }} title="Red" type="button" />
                        <button onClick={() => updateHrSetting({ color: '#2563eb' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#2563eb' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#2563eb' }} title="Blue" type="button" />
                        <button onClick={() => updateHrSetting({ color: '#16a34a' })} className={cn("w-5 h-5 rounded border-2", hrSettings.color === '#16a34a' ? 'border-primary' : 'border-border')} style={{ backgroundColor: '#16a34a' }} title="Green" type="button" />
                        <input type="color" value={hrSettings.color} onChange={(e) => updateHrSetting({ color: e.target.value })} className="w-5 h-5 cursor-pointer rounded border border-border" title="Custom color" />
                    </div>

                    <div className="w-px h-4 bg-border" />

                    {/* Width */}
                    <span className="text-xs text-muted-foreground">W:</span>
                    <button onClick={() => updateHrSetting({ width: '30px' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.width === '30px' && 'bg-accent')} type="button">30px</button>
                    <button onClick={() => updateHrSetting({ width: '25%' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.width === '25%' && 'bg-accent')} type="button">25%</button>
                    <button onClick={() => updateHrSetting({ width: '50%' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.width === '50%' && 'bg-accent')} type="button">50%</button>
                    <button onClick={() => updateHrSetting({ width: '75%' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.width === '75%' && 'bg-accent')} type="button">75%</button>
                    <button onClick={() => updateHrSetting({ width: '100%' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.width === '100%' && 'bg-accent')} type="button">100%</button>

                    <div className="w-px h-4 bg-border" />

                    {/* Height */}
                    <span className="text-xs text-muted-foreground">H:</span>
                    <button onClick={() => updateHrSetting({ height: '1px' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.height === '1px' && 'bg-accent')} type="button">1px</button>
                    <button onClick={() => updateHrSetting({ height: '2px' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.height === '2px' && 'bg-accent')} type="button">2px</button>
                    <button onClick={() => updateHrSetting({ height: '3px' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.height === '3px' && 'bg-accent')} type="button">3px</button>
                    <button onClick={() => updateHrSetting({ height: '5px' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.height === '5px' && 'bg-accent')} type="button">5px</button>

                    <div className="w-px h-4 bg-border" />

                    {/* Alignment */}
                    <button onClick={() => updateHrSetting({ alignment: 'left' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.alignment === 'left' && 'bg-accent')} type="button" title="Align Left">
                        <AlignLeft className="w-3 h-3" />
                    </button>
                    <button onClick={() => updateHrSetting({ alignment: 'center' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.alignment === 'center' && 'bg-accent')} type="button" title="Align Center">
                        <AlignCenter className="w-3 h-3" />
                    </button>
                    <button onClick={() => updateHrSetting({ alignment: 'right' })} className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", hrSettings.alignment === 'right' && 'bg-accent')} type="button" title="Align Right">
                        <AlignRight className="w-3 h-3" />
                    </button>

                    {/* Create/Update Button */}
                    {!isHrActive && (
                        <button
                            onClick={() => {
                                (editor.chain().focus() as any).setHorizontalRule(hrSettings).run();
                                setIsHrToolbarOpen(false);
                            }}
                            className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1 ml-auto"
                            type="button"
                        >
                            <Plus className="w-3 h-3" /> Insert Line
                        </button>
                    )}
                </div>
            )}
            {isImageActive && (
                <div className="border-b border-border bg-secondary px-2 py-1.5 flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-medium text-muted-foreground mr-2">Image:</span>

                    {/* Alignment */}
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'left' }).run()}
                        className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", editor.getAttributes('image').alignment === 'left' && 'bg-accent')}
                        type="button"
                        title="Align Left"
                    >
                        <AlignLeft className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'center' }).run()}
                        className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", editor.getAttributes('image').alignment === 'center' && 'bg-accent')}
                        type="button"
                        title="Align Center"
                    >
                        <AlignCenter className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { alignment: 'right' }).run()}
                        className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", editor.getAttributes('image').alignment === 'right' && 'bg-accent')}
                        type="button"
                        title="Align Right"
                    >
                        <AlignRight className="w-3 h-3" />
                    </button>



                    {/* Size Presets */}
                    <span className="text-xs text-muted-foreground">Width:</span>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { width: '25%' }).run()}
                        className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", editor.getAttributes('image').width === '25%' && 'bg-accent')}
                        type="button"
                    >
                        25%
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { width: '50%' }).run()}
                        className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", editor.getAttributes('image').width === '50%' && 'bg-accent')}
                        type="button"
                    >
                        50%
                    </button>
                    <button
                        onClick={() => editor.chain().focus().updateAttributes('image', { width: '100%' }).run()}
                        className={cn("text-xs px-2 py-0.5 border border-border rounded hover:bg-accent", editor.getAttributes('image').width === '100%' && 'bg-accent')}
                        type="button"
                    >
                        100%
                    </button>
                </div>
            )}
            {editor && (
                <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive('link')}>
                    <div className="bg-popover border border-border rounded-md shadow-md p-1 flex items-center gap-1">
                        <button
                            onClick={() => {
                                const href = editor.getAttributes('link').href;
                                window.open(href, '_blank');
                            }}
                            className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Open Link"
                            type="button"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button
                            onClick={openLinkMenu}
                            className="p-1.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit Link"
                            type="button"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            className="p-1.5 hover:bg-accent rounded text-destructive hover:text-destructive transition-colors"
                            title="Unlink"
                            type="button"
                        >
                            <UnlinkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </BubbleMenu>
            )}
        </>
    );
};

const CustomHorizontalRule = Node.create({
    name: 'horizontalRule',

    group: 'block',

    parseHTML() {
        return [
            { tag: 'hr' },
            { tag: 'div.custom-hr' },
        ];
    },

    addAttributes() {
        return {
            color: {
                default: '#e0e0e0',
                parseHTML: element => element.getAttribute('data-color') || '#e0e0e0',
                renderHTML: attributes => {
                    return {
                        'data-color': attributes.color,
                    };
                },
            },
            width: {
                default: '100%',
                parseHTML: element => element.getAttribute('data-width') || '100%',
                renderHTML: attributes => {
                    return {
                        'data-width': attributes.width,
                    };
                },
            },
            height: {
                default: '2px',
                parseHTML: element => element.getAttribute('data-height') || '2px',
                renderHTML: attributes => {
                    return {
                        'data-height': attributes.height,
                    };
                },
            },
            alignment: {
                default: 'center',
                parseHTML: element => element.getAttribute('data-alignment') || 'center',
                renderHTML: attributes => {
                    return {
                        'data-alignment': attributes.alignment,
                    };
                },
            },
        };
    },

    renderHTML({ node, HTMLAttributes }) {
        console.log('renderHTML called with node.attrs:', node?.attrs, 'HTMLAttributes:', HTMLAttributes);

        const color = node?.attrs?.color || HTMLAttributes?.color || '#e0e0e0';
        const width = node?.attrs?.width || HTMLAttributes?.width || '100%';
        const height = node?.attrs?.height || HTMLAttributes?.height || '2px';
        const alignment = node?.attrs?.alignment || HTMLAttributes?.alignment || 'center';

        let marginStyle = 'margin-left: 0; margin-right: auto;';
        if (alignment === 'center') {
            marginStyle = 'margin-left: auto; margin-right: auto;';
        } else if (alignment === 'right') {
            marginStyle = 'margin-left: auto; margin-right: 0;';
        }

        console.log('Rendering with:', { color, width, height, alignment });

        return [
            'div',
            {
                class: 'custom-hr',
                'data-color': color,
                'data-width': width,
                'data-height': height,
                'data-alignment': alignment,
                style: `border-top: ${height} solid ${color}; width: ${width}; ${marginStyle} margin-top: 1.5em; margin-bottom: 1.5em;`,
            },
        ];
    },

    addCommands() {
        return {
            setHorizontalRule: (attributes?: any) => ({ chain }: any) => {
                return chain()
                    .insertContent({
                        type: this.name,
                        attrs: attributes || {},
                    })
                    .run();
            },
        };
    },
});

const CustomTable = Table.extend({
    addAttributes() {
        const parentAttrs = this.parent?.() || {};

        return {
            ...parentAttrs,
            noBorder: {
                default: false,
                parseHTML: element => {
                    return element.hasAttribute('data-no-border') || element.classList.contains('no-border');
                },
                renderHTML: attributes => {
                    if (!attributes.noBorder) {
                        return {};
                    }
                    return {
                        'data-no-border': 'true',
                        class: 'no-border',
                    };
                },
            },
        };
    },

    addProseMirrorPlugins() {
        return [
            ...(this.parent?.() || []),
            new Plugin({
                key: new PluginKey('tableBorderToggle'),
                view: () => ({
                    update: (view) => {
                        // Find all table nodes and update their DOM
                        view.state.doc.descendants((node, pos) => {
                            if (node.type.name === 'table') {
                                const noBorder = node.attrs.noBorder;

                                // Get the DOM node for this position
                                const domAtPos = view.domAtPos(pos + 1);
                                let tableElement: HTMLElement | null = domAtPos.node as HTMLElement;

                                // Find the actual table element
                                if (tableElement && tableElement.nodeType === 3) { // 3 = TEXT_NODE
                                    tableElement = tableElement.parentElement;
                                }

                                // Traverse up to find the table
                                while (tableElement && tableElement.tagName !== 'TABLE') {
                                    tableElement = tableElement.parentElement;
                                }

                                if (tableElement && tableElement.tagName === 'TABLE') {
                                    if (noBorder) {
                                        tableElement.classList.add('no-border');
                                        tableElement.setAttribute('data-no-border', 'true');
                                    } else {
                                        tableElement.classList.remove('no-border');
                                        tableElement.removeAttribute('data-no-border');
                                    }
                                }
                            }
                        });
                    },
                }),
            }),
        ];
    },
});

const ImageResizeComponent = ({ node, updateAttributes, selected }: any) => {
    const justifyContent = node.attrs.alignment === 'center' ? 'center' :
        node.attrs.alignment === 'right' ? 'flex-end' :
            'flex-start'; // left

    return (
        <NodeViewWrapper style={{ display: 'flex', justifyContent, width: '100%', position: 'relative', lineHeight: 0 }}>
            <img
                src={node.attrs.src}
                alt={node.attrs.alt}
                style={{ width: node.attrs.width, height: 'auto', maxWidth: '100%' }}
                className={cn("rounded-md border transition-all", selected ? "ring-2 ring-primary ring-offset-2" : "")}
                crossOrigin="anonymous"
            />
        </NodeViewWrapper>
    );
};

const CustomImage = Image.extend({
    group: 'block',
    inline: false,
    draggable: false,
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: attributes => ({
                    width: attributes.width,
                    style: `width: ${attributes.width}`
                }),
                parseHTML: element => element.getAttribute('width') || element.style.width,
            },
            height: {
                default: 'auto',
                renderHTML: attributes => ({
                    height: attributes.height,
                    style: `height: ${attributes.height}`
                }),
                parseHTML: element => element.getAttribute('height') || element.style.height,
            },
            alignment: {
                default: 'center',
                renderHTML: attributes => ({
                    'data-alignment': attributes.alignment, // For styling/persistence
                    style: `display: block; margin-left: ${attributes.alignment === 'center' || attributes.alignment === 'right' ? 'auto' : '0'}; margin-right: ${attributes.alignment === 'center' || attributes.alignment === 'left' ? 'auto' : '0'}`
                }),
                parseHTML: element => element.getAttribute('data-alignment') || 'center',
            },
        };
    },
    addNodeView() {
        return ReactNodeViewRenderer(ImageResizeComponent);
    },
});

const CustomLink = Link.extend({
    addOptions() {
        return {
            ...this.parent?.(),
            openOnClick: false,
            HTMLAttributes: {
                target: '_blank',
            },
        } as LinkOptions;
    },
    addAttributes() {
        return {
            ...this.parent?.(),
            target: {
                default: '_blank',
                parseHTML: element => element.getAttribute('target'),
                renderHTML: () => ({
                    target: '_blank',
                    rel: 'noopener noreferrer nofollow',
                }),
            },
        };
    },
});

const LineHeightExtension = Extension.create({
    name: 'lineHeight',
    addOptions() {
        return {
            types: ['paragraph', 'heading'],
            defaultLineHeight: 'normal',
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    lineHeight: {
                        default: this.options.defaultLineHeight,
                        parseHTML: element => element.style.lineHeight || this.options.defaultLineHeight,
                        renderHTML: attributes => {
                            if (!attributes.lineHeight || attributes.lineHeight === this.options.defaultLineHeight) {
                                return {};
                            }
                            return { style: `line-height: ${attributes.lineHeight}` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setLineHeight: (lineHeight: string) => ({ commands }: { commands: any }) => {
                return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
            },
            unsetLineHeight: () => ({ commands }: { commands: any }) => {
                return this.options.types.every((type: string) => commands.resetAttributes(type, 'lineHeight'));
            },
        };
    },
});

export function TipTapEditor({ value, onChange, placeholder, className }: TipTapEditorProps) {
    const [, forceUpdate] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                horizontalRule: false,
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
            CustomLink.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                }
            }),
            CustomImage,
            LineHeightExtension,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            CustomHorizontalRule,
            CustomTable.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,

            TableCell,
            TextStyle,
            Color,
            BubbleMenuExtension.configure({
                pluginKey: 'bubbleMenu', // specific key if needed, or default
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onSelectionUpdate: () => {
            forceUpdate((c) => c + 1);
        },
        onTransaction: () => {
            forceUpdate((c) => c + 1);
        },
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[150px]',
                    'prose-headings:font-semibold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl',
                    'prose-p:my-2',
                    'prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-ul:pl-5 prose-ol:pl-5',
                    'prose-img:rounded-md prose-img:border',
                    className
                ),
            },
        },
        immediatelyRender: false
    });

    // Update editor content when value prop changes
    useEffect(() => {
        if (editor && value && editor.getHTML() !== value) {
            editor.commands.setContent(value);
        }
    }, [editor, value]);

    // Handle double click on links
    useEffect(() => {
        if (!editor) return;

        const editorElement = editor.options.element as HTMLElement;

        const handleDoubleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            if (link && editorElement.contains(link)) {
                e.preventDefault();
                window.open(link.href, '_blank');
            }
        };

        // Attach listener to the editor's DOM element
        if (editorElement) {
            editorElement.addEventListener('dblclick', handleDoubleClick);
            // Add click listener to prevent default navigation on single clicks
            editorElement.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const link = target.closest('a');
                if (link && editorElement.contains(link)) {
                    e.preventDefault();
                }
            });
        }

        return () => {
            if (editorElement) {
                editorElement.removeEventListener('dblclick', handleDoubleClick);
            }
        };
    }, [editor]);

    return (
        <div className="border border-border rounded-md bg-card text-card-foreground shadow-sm overflow-y-auto max-h-[600px]">
            <style jsx global>{`
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror td,
        .ProseMirror th {
          min-width: 1em;
          border: 1px solid #ced4da;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        /* No border styles - high specificity to override everything */
        .ProseMirror table[data-no-border="true"],
        .ProseMirror table.no-border {
            border: none !important;
            border-collapse: collapse !important;
        }
        .ProseMirror table[data-no-border="true"] td,
        .ProseMirror table[data-no-border="true"] th,
        .ProseMirror table.no-border td,
        .ProseMirror table.no-border th {
            border: 1px dashed #e5e7eb !important;
            border-collapse: collapse !important;
        }
        /* Ensure header cells also get the dashed border */
        .ProseMirror table[data-no-border="true"] thead th,
        .ProseMirror table.no-border thead th {
            border: 1px dashed #e5e7eb !important;
            background-color: transparent !important;
        }
        .ProseMirror th {
          font-weight: bold;
          text-align: left;
          background-color: #f1f3f5;
        }
        .ProseMirror .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
        .ProseMirror .custom-hr {
          display: block;
          height: 0;
          cursor: pointer;
        }
        .ProseMirror .custom-hr:hover {
          opacity: 0.7;
        }
        .ProseMirror ul {
            list-style-type: disc;
            padding-left: 1.5rem;
        }
        .ProseMirror ol {
            list-style-type: decimal;
            padding-left: 1.5rem;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: none;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
          text-decoration: none;
        }
        .ProseMirror blockquote {
            background: #f4f4f5;
            padding: 1rem 1rem 1rem 2.5rem;
            border-left: 4px solid #e5e7eb;
            position: relative;
            border-radius: 0.375rem;
            margin: 1.5em 0;
        }
        .ProseMirror blockquote::before {
            content: '"';
            font-size: 4rem;
            color: #d4d4d8;
            position: absolute;
            left: 0.5rem;
            top: -1rem;
            font-family: serif;
            line-height: 1;
        }
        .ProseMirror pre {
            background: #0d0d0d;
            color: #fff;
            font-family: 'JetBrains Mono', monospace;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
        }
        .ProseMirror pre code {
            color: inherit;
            padding: 0;
            background: none;
            font-size: 0.8rem;
        }
        .ProseMirror h1 {
            font-size: 2.25rem;
            font-weight: 800;
            margin-top: 1.5em;
            margin-bottom: 0.8em;
            line-height: 1.1;
        }
        .ProseMirror h2 {
            font-size: 1.875rem;
            font-weight: 700;
            margin-top: 1.4em;
            margin-bottom: 0.6em;
            line-height: 1.2;
        }
        .ProseMirror h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 1.3em;
            margin-bottom: 0.5em;
            line-height: 1.3;
        }
        .ProseMirror-selectednode {
        outline: 2px dashed var(--primary) !important;
        outline-offset: 4px;
        background-color: color-mix(in srgb, var(--primary) 10%, transparent);
        position: relative;
        cursor: pointer;
        }
      `}</style>
            <MenuBar editor={editor} />

            <EditorContent editor={editor} className="p-4" />
        </div>
    );
}
