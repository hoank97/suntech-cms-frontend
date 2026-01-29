'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';

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
} from 'lucide-react';
import { useCallback, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TipTapEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
    const isTableActive = editor && (editor.isActive('table') || editor.can().deleteTable());
    const [isLinkOpen, setIsLinkOpen] = useState(false);
    const [isColorOpen, setIsColorOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');


    const fileInputRef = useRef<HTMLInputElement>(null);

    const addImage = useCallback(() => {
        fileInputRef?.current?.click();
    }, []);

    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Assuming the port is 3003 based on context, user said 300 which is likely a typo.
            const response = await fetch('http://localhost:3003/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            // Assuming the API returns { url: '...' } or verify with user if it fails
            if (data.url) {
                editor.chain().focus().setImage({ src: data.url }).run();
            } else if (typeof data === 'string') {
                editor.chain().focus().setImage({ src: data }).run();
            } else {
                alert('Invalid response from upload server');
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
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

        const previousUrl = editor.getAttributes('link').href;
        // Get selected text or current text at cursor if inside a link
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, ' ');

        setLinkUrl(previousUrl || '');
        setLinkText(text || '');
        setIsLinkOpen(true);
    }, [editor, isLinkOpen]);

    const saveLink = useCallback(() => {
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsLinkOpen(false);
            return;
        }

        if (linkText) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: linkUrl })
                .command(({ tr }: any) => {
                    tr.insertText(linkText);
                    return true;
                })
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
        }

        setIsLinkOpen(false);
    }, [editor, linkUrl, linkText]);

    const removeLink = useCallback(() => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setIsLinkOpen(false);
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border-b border-border bg-secondary/50 p-2 flex flex-wrap gap-1 sticky top-0 z-10">
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
                <div className="relative group">
                    <button
                        className="p-2 rounded hover:bg-background transition-colors text-muted-foreground flex items-center gap-1 disabled:opacity-50"
                        title="Table Operations"
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={!isTableActive}
                    >
                        <TableIcon className="w-4 h-4" />
                        <ChevronDown className="w-3 h-3" />
                    </button>
                    {isTableActive && (
                        <div className="absolute top-full left-0 hidden group-hover:block z-50 w-48 pt-1">
                            <div className="bg-popover border border-border rounded shadow-md p-1">
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Plus className="w-3 h-3" /> Col Before
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Plus className="w-3 h-3" /> Col After
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (!editor.chain().focus().deleteColumn().run()) {
                                            editor.chain().focus().deleteTable().run();
                                        }
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm text-destructive disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="w-3 h-3" /> Delete Col
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Plus className="w-3 h-3" /> Row Before
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Plus className="w-3 h-3" /> Row After
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (!editor.chain().focus().deleteRow().run()) {
                                            editor.chain().focus().deleteTable().run();
                                        }
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm text-destructive disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="w-3 h-3" /> Delete Row
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().mergeCells().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!editor.can().mergeCells()}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Merge className="w-3 h-3" /> Merge Cells
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().splitCell().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!editor.can().splitCell()}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Split className="w-3 h-3" /> Split Cell
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm text-destructive disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="w-3 h-3" /> Delete Table
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const isNoBorder = editor.getAttributes('table').noBorder;
                                        editor.chain().focus().updateAttributes('table', { noBorder: !isNoBorder }).run();
                                    }}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1 hover:bg-accent hover:text-accent-foreground rounded text-sm disabled:opacity-50"
                                    disabled={!isTableActive}
                                    onMouseDown={(e) => e.preventDefault()}
                                >
                                    {editor.getAttributes('table').noBorder ? <><Eye className="w-3 h-3" /> Show Border</> : <><EyeOff className="w-3 h-3" /> Hide Border</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="p-2 rounded hover:bg-background transition-colors text-muted-foreground"
                    title="Horizontal Rule"
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
    );
};

export function TipTapEditor({ value, onChange, placeholder, className }: TipTapEditorProps) {
    const [, forceUpdate] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Table.extend({
                addAttributes() {
                    return {
                        noBorder: {
                            default: false,
                            parseHTML: element => element.classList.contains('no-border'),
                            renderHTML: attributes => {
                                return {
                                    class: attributes.noBorder ? 'no-border' : '',
                                }
                            },
                        },
                    };
                },
            }).configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,

            TableCell,
            TextStyle,
            Color,
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

    return (
        <div className="border border-border rounded-md overflow-hidden bg-card text-card-foreground shadow-sm">
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
        .ProseMirror table.no-border {
            border: 1px dashed #e5e7eb !important;
        }
        .ProseMirror table.no-border > tbody > tr > td,
        .ProseMirror table.no-border > tbody > tr > th {
            border: 1px dashed #e5e7eb !important;
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
          text-decoration: underline;
          cursor: pointer;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
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
      `}</style>
            <MenuBar editor={editor} />
            <EditorContent editor={editor} className="p-4" />
        </div>
    );
}
