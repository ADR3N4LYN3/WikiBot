'use client';

import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import Suggestion, { SuggestionOptions, SuggestionKeyDownProps } from '@tiptap/suggestion';
import tippy, { Instance, Props } from 'tippy.js';
import { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from 'react';
import {
  Code2,
  AlertCircle,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image,
} from 'lucide-react';
import type { Editor } from '@tiptap/core';
import type { Range } from '@tiptap/react';

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (props: { editor: Editor; range: Range }) => void;
}

const commands: CommandItem[] = [
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: <Heading1 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading2 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: <Heading3 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a bullet list',
    icon: <List className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a numbered list',
    icon: <ListOrdered className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Quote',
    description: 'Create a blockquote',
    icon: <Quote className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: 'Code Block',
    description: 'Add a code block',
    icon: <Code2 className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: 'Divider',
    description: 'Insert a horizontal divider',
    icon: <Minus className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: 'Callout',
    description: 'Add an info callout',
    icon: <AlertCircle className="w-4 h-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Info: ' }],
            },
          ],
        })
        .run();
    },
  },
  {
    title: 'Image',
    description: 'Add an image from URL',
    icon: <Image className="w-4 h-4" />,
    command: ({ editor, range }) => {
      const url = prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().deleteRange(range).setImage({ src: url }).run();
      }
    },
  },
];

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface CommandListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index];
        if (item) {
          command(item);
        }
      },
      [items, command]
    );

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: SuggestionKeyDownProps) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg p-2 text-sm text-muted-foreground">
          No commands found
        </div>
      );
    }

    return (
      <div className="bg-popover text-popover-foreground border rounded-lg shadow-lg overflow-hidden min-w-[200px]">
        {items.map((item, index) => (
          <button
            key={item.title}
            onClick={() => selectItem(index)}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-muted transition-colors ${
              index === selectedIndex ? 'bg-muted' : ''
            }`}
          >
            <div className="flex-shrink-0 text-muted-foreground">{item.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
);

CommandList.displayName = 'CommandList';

const suggestion: Omit<SuggestionOptions, 'editor'> = {
  items: ({ query }: { query: string }) => {
    return commands.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  },

  render: () => {
    let component: ReactRenderer<CommandListRef> | null = null;
    let popup: Instance<Props>[] | null = null;

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onUpdate: (props: any) => {
        component?.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          popup?.[0]?.hide();
          return true;
        }

        return component?.ref?.onKeyDown(props) || false;
      },

      onExit: () => {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: CommandItem }) => {
          props.command({ editor, range });
        },
        ...suggestion,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
