/* eslint-disable max-classes-per-file */
import { translate } from '@ckeditor/ckeditor5-utils/src/translation-service';
import Blockquote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import ShiftEnter from '@ckeditor/ckeditor5-enter/src/shiftenter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Emoji from './emoji/emoji';
import WidgetFixer from './widget-fixer/widgetfixer';
import MagicBlock from './magic-block/magicblock';
import TableFixer from './table-fixer/tablefixer';
import SelectionGravityFixer from './selection-gravity-fixer/selectiongravityfixer';
import ClipboardFixer from './clipboard-fixer/clipboardfixer';
import InlineImage from './inline-image/inlineimage';
import Autoformat from './autoformat/autoformat';

import './teditorlocale';
import './theme/teditor.css';


export default class TEditor extends ClassicEditorBase { }
export class TEditorDecoupled extends DecoupledEditorBase { }

TEditor.builtinPlugins = [
  Autoformat,
  Blockquote,
  Clipboard,
  FontColor,
  FontSize,
  Enter,
  Heading,
  ShiftEnter,
  Typing,
  Undo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  List,
  Paragraph,
  Indent,
  IndentBlock,
  Alignment,
  Table,
  TableToolbar,
  PasteFromOffice,
  RemoveFormat,
  Image,
  ImageUpload,
  ImageResize,
  Emoji,
  HorizontalLine,
  WidgetFixer,
  MagicBlock,
  TableFixer,
  SelectionGravityFixer,
  ClipboardFixer,
  InlineImage,
];
TEditorDecoupled.builtinPlugins = TEditor.builtinPlugins;

TEditor.defaultConfig = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'fontsize',
      'fontcolor',
      '|',
      'numberedList',
      'bulletedList',
      'blockquote',
      'insertTable',
      'horizontalLine',
      '|',
      'emoji',
      'link',
      'imageUpload',
      '|',
      'alignment',
      'removeFormat',
    ],
  },
  heading: {
    options: [{
      model: 'paragraph', title: translate('zh-CN', 'Main body'), class: 'ck-heading_paragraph',
    }, {
      model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1',
    }, {
      model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2',
    }, {
      model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3',
    }, {
      model: 'heading4', view: 'h5', title: 'Heading 4', class: 'ck-heading_heading4',
    }],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
  language: 'zh-cN',
};

TEditorDecoupled.defaultConfig = TEditor.defaultConfig;
